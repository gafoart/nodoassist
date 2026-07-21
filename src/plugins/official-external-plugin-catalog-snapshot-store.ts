/** Persists hosted official external plugin catalog snapshots in NodoAssist state. */
import { existsSync } from "node:fs";
import {
  executeSqliteQuerySync,
  executeSqliteQueryTakeFirstSync,
  getNodeSqliteKysely,
} from "../infra/kysely-sync.js";
import type { DB as NodoAssistStateKyselyDatabase } from "../state/nodoassist-state-db.generated.js";
import {
  openNodoAssistStateDatabase,
  runNodoAssistStateWriteTransaction,
  type NodoAssistStateDatabaseOptions,
} from "../state/nodoassist-state-db.js";
import { resolveNodoAssistStateSqlitePath } from "../state/nodoassist-state-db.paths.js";
import type {
  HostedOfficialExternalPluginCatalogMetadata,
  HostedOfficialExternalPluginCatalogSnapshot,
  HostedOfficialExternalPluginCatalogSnapshotStore,
} from "./official-external-plugin-catalog.js";

export type HostedOfficialExternalPluginCatalogSnapshotStoreOptions = {
  env?: NodeJS.ProcessEnv;
  stateDir?: string;
  stateDatabasePath?: string;
};

type HostedCatalogSnapshotRow = {
  feed_url: string;
  body: string;
  status: number | bigint;
  etag: string | null;
  last_modified: string | null;
  checksum: string;
  saved_at: string;
};

type HostedCatalogSnapshotDatabase = Pick<
  NodoAssistStateKyselyDatabase,
  "official_external_plugin_catalog_snapshots"
>;

function resolveStoreEnv(
  options: HostedOfficialExternalPluginCatalogSnapshotStoreOptions,
): NodeJS.ProcessEnv | undefined {
  if (!options.stateDir) {
    return options.env;
  }
  return {
    ...(options.env ?? process.env),
    NODOASSIST_STATE_DIR: options.stateDir,
  };
}

function resolveStateDatabaseOptions(
  options: HostedOfficialExternalPluginCatalogSnapshotStoreOptions,
): NodoAssistStateDatabaseOptions {
  const env = resolveStoreEnv(options);
  return {
    ...(env ? { env } : {}),
    ...(options.stateDatabasePath ? { path: options.stateDatabasePath } : {}),
  };
}

function resolveStateDatabasePath(
  options: HostedOfficialExternalPluginCatalogSnapshotStoreOptions,
): string {
  if (options.stateDatabasePath) {
    return options.stateDatabasePath;
  }
  return resolveNodoAssistStateSqlitePath(resolveStoreEnv(options) ?? process.env);
}

function rowToSnapshot(
  row: HostedCatalogSnapshotRow | undefined,
): HostedOfficialExternalPluginCatalogSnapshot | null {
  if (!row) {
    return null;
  }
  const metadata: HostedOfficialExternalPluginCatalogMetadata = {
    url: row.feed_url,
    status: Number(row.status),
    checksum: row.checksum,
    ...(row.etag ? { etag: row.etag } : {}),
    ...(row.last_modified ? { lastModified: row.last_modified } : {}),
  };
  return {
    body: row.body,
    metadata,
    savedAt: row.saved_at,
  };
}

/** Creates a snapshot store backed by the shared `state/nodoassist.sqlite` database. */
export function createSqliteHostedOfficialExternalPluginCatalogSnapshotStore(
  options: HostedOfficialExternalPluginCatalogSnapshotStoreOptions = {},
): HostedOfficialExternalPluginCatalogSnapshotStore {
  return {
    async read(url) {
      const pathname = resolveStateDatabasePath(options);
      if (!existsSync(pathname)) {
        return null;
      }
      const database = openNodoAssistStateDatabase(resolveStateDatabaseOptions(options));
      const stateDb = getNodeSqliteKysely<HostedCatalogSnapshotDatabase>(database.db);
      const row = executeSqliteQueryTakeFirstSync(
        database.db,
        stateDb
          .selectFrom("official_external_plugin_catalog_snapshots")
          .select(["feed_url", "body", "status", "etag", "last_modified", "checksum", "saved_at"])
          .where("feed_url", "=", url),
      ) as HostedCatalogSnapshotRow | undefined;
      return rowToSnapshot(row);
    },
    async write(snapshot) {
      const now = Date.now();
      runNodoAssistStateWriteTransaction((database) => {
        const stateDb = getNodeSqliteKysely<HostedCatalogSnapshotDatabase>(database.db);
        executeSqliteQuerySync(
          database.db,
          stateDb
            .insertInto("official_external_plugin_catalog_snapshots")
            .values({
              feed_url: snapshot.metadata.url,
              body: snapshot.body,
              status: snapshot.metadata.status,
              etag: snapshot.metadata.etag ?? null,
              last_modified: snapshot.metadata.lastModified ?? null,
              checksum: snapshot.metadata.checksum,
              saved_at: snapshot.savedAt,
              updated_at_ms: now,
            })
            .onConflict((conflict) =>
              conflict.column("feed_url").doUpdateSet({
                body: snapshot.body,
                status: snapshot.metadata.status,
                etag: snapshot.metadata.etag ?? null,
                last_modified: snapshot.metadata.lastModified ?? null,
                checksum: snapshot.metadata.checksum,
                saved_at: snapshot.savedAt,
                updated_at_ms: now,
              }),
            ),
        );
      }, resolveStateDatabaseOptions(options));
    },
  };
}
