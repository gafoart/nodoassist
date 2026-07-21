// NodoAssist agent database stores agent-scoped persisted runtime state.
import { chmodSync, existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";
import {
  clearNodeSqliteKyselyCacheForDatabase,
  executeSqliteQuerySync,
  getNodeSqliteKysely,
} from "../infra/kysely-sync.js";
import { requireNodeSqlite } from "../infra/node-sqlite.js";
import { resolveSqliteDatabaseFilePaths } from "../infra/sqlite-files.js";
import { runSqliteImmediateTransactionSync } from "../infra/sqlite-transaction.js";
import { readSqliteUserVersion } from "../infra/sqlite-user-version.js";
import {
  configureSqliteConnectionPragmas,
  registerSqliteCacheExitClose,
  type SqliteWalMaintenance,
} from "../infra/sqlite-wal.js";
import { normalizeAgentId } from "../routing/session-key.js";
import type { DB as NodoAssistAgentKyselyDatabase } from "./nodoassist-agent-db.generated.js";
import { resolveNodoAssistAgentSqlitePath } from "./nodoassist-agent-db.paths.js";
import { NODOASSIST_AGENT_SCHEMA_SQL } from "./nodoassist-agent-schema.generated.js";
import type { DB as NodoAssistStateKyselyDatabase } from "./nodoassist-state-db.generated.js";
import {
  NODOASSIST_SQLITE_BUSY_TIMEOUT_MS,
  runNodoAssistStateWriteTransaction,
  type NodoAssistStateDatabaseOptions,
} from "./nodoassist-state-db.js";
export { resolveNodoAssistAgentSqlitePath } from "./nodoassist-agent-db.paths.js";

/**
 * Per-agent SQLite database lifecycle and shared-state registration.
 *
 * Each opened agent database is schema-owned by one normalized agent id, cached
 * per pathname, protected with private file modes, and registered in the shared
 * NodoAssist state database for discovery and maintenance.
 */
const NODOASSIST_AGENT_SCHEMA_VERSION = 1;
const NODOASSIST_AGENT_DB_DIR_MODE = 0o700;
const NODOASSIST_AGENT_DB_FILE_MODE = 0o600;

/** Open per-agent SQLite database handle plus lifecycle maintenance. */
export type NodoAssistAgentDatabase = {
  agentId: string;
  db: DatabaseSync;
  path: string;
  walMaintenance: SqliteWalMaintenance;
};

/** Options for resolving and opening one agent database. */
export type NodoAssistAgentDatabaseOptions = NodoAssistStateDatabaseOptions & {
  agentId: string;
};

type NodoAssistAgentMetadataDatabase = Pick<NodoAssistAgentKyselyDatabase, "schema_meta">;
type NodoAssistAgentRegistryDatabase = Pick<NodoAssistStateKyselyDatabase, "agent_databases">;

const cachedDatabases = new Map<string, NodoAssistAgentDatabase>();

type ExistingSchemaMeta = {
  agentId: string | null;
  role: string | null;
};

function assertSupportedAgentSchemaVersion(db: DatabaseSync, pathname: string): void {
  const userVersion = readSqliteUserVersion(db);
  if (userVersion > NODOASSIST_AGENT_SCHEMA_VERSION) {
    throw new Error(
      `NodoAssist agent database ${pathname} uses newer schema version ${userVersion}; this NodoAssist build supports ${NODOASSIST_AGENT_SCHEMA_VERSION}.`,
    );
  }
}

function ensureNodoAssistAgentDatabasePermissions(
  pathname: string,
  options: NodoAssistAgentDatabaseOptions,
): void {
  const dir = path.dirname(pathname);
  const defaultPath = resolveNodoAssistAgentSqlitePath({
    agentId: options.agentId,
    env: options.env,
  });
  const isDefaultAgentDatabase = path.resolve(pathname) === path.resolve(defaultPath);
  const dirExisted = existsSync(dir);
  mkdirSync(dir, { recursive: true, mode: NODOASSIST_AGENT_DB_DIR_MODE });
  // Default agent state is private by contract; custom pre-existing dirs keep caller ownership.
  if (isDefaultAgentDatabase || !dirExisted) {
    chmodSync(dir, NODOASSIST_AGENT_DB_DIR_MODE);
  }
  for (const candidate of resolveSqliteDatabaseFilePaths(pathname)) {
    if (existsSync(candidate)) {
      chmodSync(candidate, NODOASSIST_AGENT_DB_FILE_MODE);
    }
  }
}

function readExistingSchemaMeta(db: DatabaseSync): ExistingSchemaMeta | null {
  const schemaMetaTable = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'schema_meta'")
    .get();
  if (!schemaMetaTable) {
    return null;
  }
  const row = db
    .prepare("SELECT role, agent_id FROM schema_meta WHERE meta_key = 'primary'")
    .get() as { agent_id?: unknown; role?: unknown } | undefined;
  if (!row) {
    return null;
  }
  return {
    agentId: typeof row.agent_id === "string" ? row.agent_id : null,
    role: typeof row.role === "string" ? row.role : null,
  };
}

function assertExistingSchemaOwner(
  existing: ExistingSchemaMeta | null,
  agentId: string,
  pathname: string,
): void {
  if (!existing) {
    return;
  }
  // Agent DB files are not interchangeable; opening another role/id would corrupt ownership.
  if (existing.role !== "agent") {
    throw new Error(
      `NodoAssist agent database ${pathname} has schema role ${existing.role ?? "unknown"}; expected agent.`,
    );
  }
  if (!existing.agentId) {
    throw new Error(`NodoAssist agent database ${pathname} has no agent owner.`);
  }
  if (normalizeAgentId(existing.agentId) !== agentId) {
    throw new Error(
      `NodoAssist agent database ${pathname} belongs to agent ${existing.agentId}; requested agent ${agentId}.`,
    );
  }
}

function ensureAgentSchema(db: DatabaseSync, agentId: string, pathname: string): void {
  assertSupportedAgentSchemaVersion(db, pathname);
  assertExistingSchemaOwner(readExistingSchemaMeta(db), agentId, pathname);
  db.exec(NODOASSIST_AGENT_SCHEMA_SQL);
  const kysely = getNodeSqliteKysely<NodoAssistAgentMetadataDatabase>(db);
  db.exec(`PRAGMA user_version = ${NODOASSIST_AGENT_SCHEMA_VERSION};`);
  const now = Date.now();
  executeSqliteQuerySync(
    db,
    kysely
      .insertInto("schema_meta")
      .values({
        meta_key: "primary",
        role: "agent",
        schema_version: NODOASSIST_AGENT_SCHEMA_VERSION,
        agent_id: agentId,
        app_version: null,
        created_at: now,
        updated_at: now,
      })
      .onConflict((conflict) =>
        conflict.column("meta_key").doUpdateSet({
          role: "agent",
          schema_version: NODOASSIST_AGENT_SCHEMA_VERSION,
          agent_id: agentId,
          app_version: null,
          updated_at: now,
        }),
      ),
  );
}

/** Initialize agent schema/ownership metadata on an independently managed connection. */
export function ensureNodoAssistAgentDatabaseSchema(
  db: DatabaseSync,
  options: NodoAssistAgentDatabaseOptions & { register?: boolean },
): void {
  const agentId = normalizeAgentId(options.agentId);
  const databaseOptions = { ...options, agentId };
  const pathname = resolveNodoAssistAgentSqlitePath(databaseOptions);
  ensureNodoAssistAgentDatabasePermissions(pathname, databaseOptions);
  ensureAgentSchema(db, agentId, pathname);
  ensureNodoAssistAgentDatabasePermissions(pathname, databaseOptions);
  if (options.register === true) {
    registerAgentDatabase({ agentId, path: pathname, env: options.env });
  }
}

function registerAgentDatabase(params: {
  agentId: string;
  path: string;
  env?: NodeJS.ProcessEnv;
}): void {
  let sizeBytes: number | null = null;
  try {
    sizeBytes = statSync(params.path).size;
  } catch {
    sizeBytes = null;
  }
  const lastSeenAt = Date.now();
  runNodoAssistStateWriteTransaction(
    (database) => {
      const db = getNodeSqliteKysely<NodoAssistAgentRegistryDatabase>(database.db);
      executeSqliteQuerySync(
        database.db,
        db
          .insertInto("agent_databases")
          .values({
            agent_id: params.agentId,
            path: params.path,
            schema_version: NODOASSIST_AGENT_SCHEMA_VERSION,
            last_seen_at: lastSeenAt,
            size_bytes: sizeBytes,
          })
          .onConflict((conflict) =>
            conflict.columns(["agent_id", "path"]).doUpdateSet({
              schema_version: NODOASSIST_AGENT_SCHEMA_VERSION,
              last_seen_at: lastSeenAt,
              size_bytes: sizeBytes,
            }),
          ),
      );
    },
    { env: params.env },
  );
}

/** Open or return a cached per-agent database after schema and owner validation. */
export function openNodoAssistAgentDatabase(
  options: NodoAssistAgentDatabaseOptions,
): NodoAssistAgentDatabase {
  const agentId = normalizeAgentId(options.agentId);
  const databaseOptions = { ...options, agentId };
  const pathname = resolveNodoAssistAgentSqlitePath(databaseOptions);
  const cached = cachedDatabases.get(pathname);
  if (cached?.db.isOpen) {
    if (cached.agentId !== agentId) {
      throw new Error(
        `NodoAssist agent database ${pathname} is already open for agent ${cached.agentId}; requested agent ${agentId}.`,
      );
    }
    registerAgentDatabase({ agentId, path: pathname, env: options.env });
    return cached;
  }
  if (cached) {
    // A closed handle can leave Kysely and WAL helpers cached; clear both before reopening.
    cached.walMaintenance.close();
    clearNodeSqliteKyselyCacheForDatabase(cached.db);
    cachedDatabases.delete(pathname);
  }

  ensureNodoAssistAgentDatabasePermissions(pathname, databaseOptions);
  const sqlite = requireNodeSqlite();
  const db = new sqlite.DatabaseSync(pathname);
  const walMaintenance = (() => {
    let maintenance: SqliteWalMaintenance | undefined;
    try {
      maintenance = configureSqliteConnectionPragmas(db, {
        busyTimeoutMs: NODOASSIST_SQLITE_BUSY_TIMEOUT_MS,
        databaseLabel: `nodoassist-agent:${agentId}`,
        databasePath: pathname,
        foreignKeys: true,
        synchronous: "NORMAL",
      });
      ensureAgentSchema(db, agentId, pathname);
      return maintenance;
    } catch (err) {
      maintenance?.close();
      db.close();
      throw err;
    }
  })();
  ensureNodoAssistAgentDatabasePermissions(pathname, databaseOptions);
  const database = { agentId, db, path: pathname, walMaintenance };
  cachedDatabases.set(pathname, database);
  // Safety net for processes that end without an orderly close: agent DBs have
  // no shutdown owner like the ACP/gateway state DB closes. Closing unregisters.
  unregisterExitClose ??= registerSqliteCacheExitClose(closeNodoAssistAgentDatabases);
  registerAgentDatabase({ agentId, path: pathname, env: options.env });
  return database;
}

/** Run a synchronous immediate transaction against an agent database. */
export function runNodoAssistAgentWriteTransaction<T>(
  operation: (database: NodoAssistAgentDatabase) => T,
  options: NodoAssistAgentDatabaseOptions,
): T {
  const database = openNodoAssistAgentDatabase(options);
  const result = runSqliteImmediateTransactionSync(database.db, () => operation(database));
  ensureNodoAssistAgentDatabasePermissions(database.path, options);
  return result;
}

let unregisterExitClose: (() => void) | null = null;

/** Close all cached agent database handles. */
export function closeNodoAssistAgentDatabases(): void {
  unregisterExitClose?.();
  unregisterExitClose = null;
  for (const database of cachedDatabases.values()) {
    database.walMaintenance.close();
    clearNodeSqliteKyselyCacheForDatabase(database.db);
    if (database.db.isOpen) {
      database.db.close();
    }
  }
  cachedDatabases.clear();
}

/** Test alias for closing cached agent database handles from teardown code. */
export const closeNodoAssistAgentDatabasesForTest = closeNodoAssistAgentDatabases;
