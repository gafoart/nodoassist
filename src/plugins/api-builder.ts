// Builds plugin API objects from config, registries, and runtime helpers.
import type { NodoAssistConfig } from "../config/types.nodoassist.js";
import { attachPluginApiFacades, type NodoAssistPluginApiWithoutFacades } from "./api-facades.js";
import type { PluginRuntime } from "./runtime/types.js";
import type { NodoAssistPluginApi, PluginLogger } from "./types.js";

export type BuildPluginApiParams = {
  id: string;
  name: string;
  version?: string;
  description?: string;
  source: string;
  rootDir?: string;
  registrationMode: NodoAssistPluginApi["registrationMode"];
  config: NodoAssistConfig;
  pluginConfig?: Record<string, unknown>;
  runtime: PluginRuntime;
  logger: PluginLogger;
  resolvePath: (input: string) => string;
  handlers?: Partial<
    Pick<
      NodoAssistPluginApi,
      | "registerTool"
      | "registerHook"
      | "registerHttpRoute"
      | "registerHostedMediaResolver"
      | "registerChannel"
      | "registerGatewayMethod"
      | "registerCli"
      | "registerReload"
      | "registerNodeHostCommand"
      | "registerNodeInvokePolicy"
      | "registerSecurityAuditCollector"
      | "registerService"
      | "registerGatewayDiscoveryService"
      | "registerCliBackend"
      | "registerTextTransforms"
      | "registerConfigMigration"
      | "registerMigrationProvider"
      | "registerAutoEnableProbe"
      | "registerProvider"
      | "registerModelCatalogProvider"
      | "registerEmbeddingProvider"
      | "registerSpeechProvider"
      | "registerRealtimeTranscriptionProvider"
      | "registerRealtimeVoiceProvider"
      | "registerMediaUnderstandingProvider"
      | "registerTranscriptSourceProvider"
      | "registerImageGenerationProvider"
      | "registerVideoGenerationProvider"
      | "registerMusicGenerationProvider"
      | "registerWebFetchProvider"
      | "registerWebSearchProvider"
      | "registerInteractiveHandler"
      | "onConversationBindingResolved"
      | "registerCommand"
      | "registerContextEngine"
      | "registerCompactionProvider"
      | "registerAgentHarness"
      | "registerCodexAppServerExtensionFactory"
      | "registerAgentToolResultMiddleware"
      | "registerSessionExtension"
      | "enqueueNextTurnInjection"
      | "registerTrustedToolPolicy"
      | "registerToolMetadata"
      | "registerControlUiDescriptor"
      | "registerRuntimeLifecycle"
      | "registerAgentEventSubscription"
      | "emitAgentEvent"
      | "setRunContext"
      | "getRunContext"
      | "clearRunContext"
      | "registerSessionSchedulerJob"
      | "registerSessionAction"
      | "sendSessionAttachment"
      | "scheduleSessionTurn"
      | "unscheduleSessionTurnsByTag"
      | "registerDetachedTaskRuntime"
      | "registerMemoryCapability"
      | "registerMemoryPromptSection"
      | "registerMemoryPromptSupplement"
      | "registerMemoryCorpusSupplement"
      | "registerMemoryFlushPlan"
      | "registerMemoryRuntime"
      | "registerMemoryEmbeddingProvider"
      | "on"
    >
  >;
};

const noopRegisterTool: NodoAssistPluginApi["registerTool"] = () => {};
const noopRegisterHook: NodoAssistPluginApi["registerHook"] = () => {};
const noopRegisterHttpRoute: NodoAssistPluginApi["registerHttpRoute"] = () => {};
const noopRegisterHostedMediaResolver: NodoAssistPluginApi["registerHostedMediaResolver"] =
  () => {};
const noopRegisterChannel: NodoAssistPluginApi["registerChannel"] = () => {};
const noopRegisterGatewayMethod: NodoAssistPluginApi["registerGatewayMethod"] = () => {};
const noopRegisterCli: NodoAssistPluginApi["registerCli"] = () => {};
const noopRegisterReload: NodoAssistPluginApi["registerReload"] = () => {};
const noopRegisterNodeHostCommand: NodoAssistPluginApi["registerNodeHostCommand"] = () => {};
const noopRegisterNodeInvokePolicy: NodoAssistPluginApi["registerNodeInvokePolicy"] = () => {};
const noopRegisterSecurityAuditCollector: NodoAssistPluginApi["registerSecurityAuditCollector"] =
  () => {};
const noopRegisterService: NodoAssistPluginApi["registerService"] = () => {};
const noopRegisterGatewayDiscoveryService: NodoAssistPluginApi["registerGatewayDiscoveryService"] =
  () => {};
const noopRegisterCliBackend: NodoAssistPluginApi["registerCliBackend"] = () => {};
const noopRegisterTextTransforms: NodoAssistPluginApi["registerTextTransforms"] = () => {};
const noopRegisterConfigMigration: NodoAssistPluginApi["registerConfigMigration"] = () => {};
const noopRegisterMigrationProvider: NodoAssistPluginApi["registerMigrationProvider"] = () => {};
const noopRegisterAutoEnableProbe: NodoAssistPluginApi["registerAutoEnableProbe"] = () => {};
const noopRegisterProvider: NodoAssistPluginApi["registerProvider"] = () => {};
const noopRegisterModelCatalogProvider: NodoAssistPluginApi["registerModelCatalogProvider"] =
  () => {};
const noopRegisterEmbeddingProvider: NodoAssistPluginApi["registerEmbeddingProvider"] = () => {};
const noopRegisterSpeechProvider: NodoAssistPluginApi["registerSpeechProvider"] = () => {};
const noopRegisterRealtimeTranscriptionProvider: NodoAssistPluginApi["registerRealtimeTranscriptionProvider"] =
  () => {};
const noopRegisterRealtimeVoiceProvider: NodoAssistPluginApi["registerRealtimeVoiceProvider"] =
  () => {};
const noopRegisterMediaUnderstandingProvider: NodoAssistPluginApi["registerMediaUnderstandingProvider"] =
  () => {};
const noopRegisterTranscriptsSourceProvider: NodoAssistPluginApi["registerTranscriptSourceProvider"] =
  () => {};
const noopRegisterImageGenerationProvider: NodoAssistPluginApi["registerImageGenerationProvider"] =
  () => {};
const noopRegisterVideoGenerationProvider: NodoAssistPluginApi["registerVideoGenerationProvider"] =
  () => {};
const noopRegisterMusicGenerationProvider: NodoAssistPluginApi["registerMusicGenerationProvider"] =
  () => {};
const noopRegisterWebFetchProvider: NodoAssistPluginApi["registerWebFetchProvider"] = () => {};
const noopRegisterWebSearchProvider: NodoAssistPluginApi["registerWebSearchProvider"] = () => {};
const noopRegisterInteractiveHandler: NodoAssistPluginApi["registerInteractiveHandler"] = () => {};
const noopOnConversationBindingResolved: NodoAssistPluginApi["onConversationBindingResolved"] =
  () => {};
const noopRegisterCommand: NodoAssistPluginApi["registerCommand"] = () => {};
const noopRegisterContextEngine: NodoAssistPluginApi["registerContextEngine"] = () => {};
const noopRegisterCompactionProvider: NodoAssistPluginApi["registerCompactionProvider"] = () => {};
const noopRegisterAgentHarness: NodoAssistPluginApi["registerAgentHarness"] = () => {};
const noopRegisterCodexAppServerExtensionFactory: NodoAssistPluginApi["registerCodexAppServerExtensionFactory"] =
  () => {};
const noopRegisterAgentToolResultMiddleware: NodoAssistPluginApi["registerAgentToolResultMiddleware"] =
  () => {};
const noopRegisterSessionExtension: NodoAssistPluginApi["registerSessionExtension"] = () => {};
const noopEnqueueNextTurnInjection: NodoAssistPluginApi["enqueueNextTurnInjection"] = async (
  injection,
) => ({ enqueued: false, id: "", sessionKey: injection.sessionKey });
const noopRegisterTrustedToolPolicy: NodoAssistPluginApi["registerTrustedToolPolicy"] = () => {};
const noopRegisterToolMetadata: NodoAssistPluginApi["registerToolMetadata"] = () => {};
const noopRegisterControlUiDescriptor: NodoAssistPluginApi["registerControlUiDescriptor"] =
  () => {};
const noopRegisterRuntimeLifecycle: NodoAssistPluginApi["registerRuntimeLifecycle"] = () => {};
const noopRegisterAgentEventSubscription: NodoAssistPluginApi["registerAgentEventSubscription"] =
  () => {};
const noopEmitAgentEvent: NodoAssistPluginApi["emitAgentEvent"] = () => ({
  emitted: false,
  reason: "not wired",
});
const noopSetRunContext: NodoAssistPluginApi["setRunContext"] = () => false;
const noopGetRunContext: NodoAssistPluginApi["getRunContext"] = () => undefined;
const noopClearRunContext: NodoAssistPluginApi["clearRunContext"] = () => {};
const noopRegisterSessionSchedulerJob: NodoAssistPluginApi["registerSessionSchedulerJob"] = () =>
  undefined;
const noopRegisterSessionAction: NodoAssistPluginApi["registerSessionAction"] = () => {};
const noopSendSessionAttachment: NodoAssistPluginApi["sendSessionAttachment"] = async () => ({
  ok: false,
  error: "not wired",
});
const noopScheduleSessionTurn: NodoAssistPluginApi["scheduleSessionTurn"] = async () => undefined;
const noopUnscheduleSessionTurnsByTag: NodoAssistPluginApi["unscheduleSessionTurnsByTag"] =
  async () => ({ removed: 0, failed: 0 });
const noopRegisterDetachedTaskRuntime: NodoAssistPluginApi["registerDetachedTaskRuntime"] =
  () => {};
const noopRegisterMemoryCapability: NodoAssistPluginApi["registerMemoryCapability"] = () => {};
const noopRegisterMemoryPromptSection: NodoAssistPluginApi["registerMemoryPromptSection"] =
  () => {};
const noopRegisterMemoryPromptSupplement: NodoAssistPluginApi["registerMemoryPromptSupplement"] =
  () => {};
const noopRegisterMemoryCorpusSupplement: NodoAssistPluginApi["registerMemoryCorpusSupplement"] =
  () => {};
const noopRegisterMemoryFlushPlan: NodoAssistPluginApi["registerMemoryFlushPlan"] = () => {};
const noopRegisterMemoryRuntime: NodoAssistPluginApi["registerMemoryRuntime"] = () => {};
const noopRegisterMemoryEmbeddingProvider: NodoAssistPluginApi["registerMemoryEmbeddingProvider"] =
  () => {};
const noopOn: NodoAssistPluginApi["on"] = () => {};

export function buildPluginApi(params: BuildPluginApiParams): NodoAssistPluginApi {
  const handlers = params.handlers ?? {};
  const registerCli = handlers.registerCli ?? noopRegisterCli;
  const api: NodoAssistPluginApiWithoutFacades = {
    id: params.id,
    name: params.name,
    version: params.version,
    description: params.description,
    source: params.source,
    rootDir: params.rootDir,
    registrationMode: params.registrationMode,
    config: params.config,
    pluginConfig: params.pluginConfig,
    runtime: params.runtime,
    logger: params.logger,
    registerTool: handlers.registerTool ?? noopRegisterTool,
    registerHook: handlers.registerHook ?? noopRegisterHook,
    registerHttpRoute: handlers.registerHttpRoute ?? noopRegisterHttpRoute,
    registerHostedMediaResolver:
      handlers.registerHostedMediaResolver ?? noopRegisterHostedMediaResolver,
    registerChannel: handlers.registerChannel ?? noopRegisterChannel,
    registerGatewayMethod: handlers.registerGatewayMethod ?? noopRegisterGatewayMethod,
    registerCli,
    registerNodeCliFeature: (registrar, opts) =>
      registerCli(registrar, {
        ...opts,
        parentPath: ["nodes"],
      }),
    registerReload: handlers.registerReload ?? noopRegisterReload,
    registerNodeHostCommand: handlers.registerNodeHostCommand ?? noopRegisterNodeHostCommand,
    registerNodeInvokePolicy: handlers.registerNodeInvokePolicy ?? noopRegisterNodeInvokePolicy,
    registerSecurityAuditCollector:
      handlers.registerSecurityAuditCollector ?? noopRegisterSecurityAuditCollector,
    registerService: handlers.registerService ?? noopRegisterService,
    registerGatewayDiscoveryService:
      handlers.registerGatewayDiscoveryService ?? noopRegisterGatewayDiscoveryService,
    registerCliBackend: handlers.registerCliBackend ?? noopRegisterCliBackend,
    registerTextTransforms: handlers.registerTextTransforms ?? noopRegisterTextTransforms,
    registerConfigMigration: handlers.registerConfigMigration ?? noopRegisterConfigMigration,
    registerMigrationProvider: handlers.registerMigrationProvider ?? noopRegisterMigrationProvider,
    registerAutoEnableProbe: handlers.registerAutoEnableProbe ?? noopRegisterAutoEnableProbe,
    registerProvider: handlers.registerProvider ?? noopRegisterProvider,
    registerModelCatalogProvider:
      handlers.registerModelCatalogProvider ?? noopRegisterModelCatalogProvider,
    registerEmbeddingProvider: handlers.registerEmbeddingProvider ?? noopRegisterEmbeddingProvider,
    registerSpeechProvider: handlers.registerSpeechProvider ?? noopRegisterSpeechProvider,
    registerRealtimeTranscriptionProvider:
      handlers.registerRealtimeTranscriptionProvider ?? noopRegisterRealtimeTranscriptionProvider,
    registerRealtimeVoiceProvider:
      handlers.registerRealtimeVoiceProvider ?? noopRegisterRealtimeVoiceProvider,
    registerMediaUnderstandingProvider:
      handlers.registerMediaUnderstandingProvider ?? noopRegisterMediaUnderstandingProvider,
    registerTranscriptSourceProvider:
      handlers.registerTranscriptSourceProvider ?? noopRegisterTranscriptsSourceProvider,
    registerImageGenerationProvider:
      handlers.registerImageGenerationProvider ?? noopRegisterImageGenerationProvider,
    registerVideoGenerationProvider:
      handlers.registerVideoGenerationProvider ?? noopRegisterVideoGenerationProvider,
    registerMusicGenerationProvider:
      handlers.registerMusicGenerationProvider ?? noopRegisterMusicGenerationProvider,
    registerWebFetchProvider: handlers.registerWebFetchProvider ?? noopRegisterWebFetchProvider,
    registerWebSearchProvider: handlers.registerWebSearchProvider ?? noopRegisterWebSearchProvider,
    registerInteractiveHandler:
      handlers.registerInteractiveHandler ?? noopRegisterInteractiveHandler,
    onConversationBindingResolved:
      handlers.onConversationBindingResolved ?? noopOnConversationBindingResolved,
    registerCommand: handlers.registerCommand ?? noopRegisterCommand,
    registerContextEngine: handlers.registerContextEngine ?? noopRegisterContextEngine,
    registerCompactionProvider:
      handlers.registerCompactionProvider ?? noopRegisterCompactionProvider,
    registerAgentHarness: handlers.registerAgentHarness ?? noopRegisterAgentHarness,
    registerCodexAppServerExtensionFactory:
      handlers.registerCodexAppServerExtensionFactory ?? noopRegisterCodexAppServerExtensionFactory,
    registerAgentToolResultMiddleware:
      handlers.registerAgentToolResultMiddleware ?? noopRegisterAgentToolResultMiddleware,
    registerSessionExtension: handlers.registerSessionExtension ?? noopRegisterSessionExtension,
    enqueueNextTurnInjection: handlers.enqueueNextTurnInjection ?? noopEnqueueNextTurnInjection,
    registerTrustedToolPolicy: handlers.registerTrustedToolPolicy ?? noopRegisterTrustedToolPolicy,
    registerToolMetadata: handlers.registerToolMetadata ?? noopRegisterToolMetadata,
    registerControlUiDescriptor:
      handlers.registerControlUiDescriptor ?? noopRegisterControlUiDescriptor,
    registerRuntimeLifecycle: handlers.registerRuntimeLifecycle ?? noopRegisterRuntimeLifecycle,
    registerAgentEventSubscription:
      handlers.registerAgentEventSubscription ?? noopRegisterAgentEventSubscription,
    emitAgentEvent: handlers.emitAgentEvent ?? noopEmitAgentEvent,
    setRunContext: handlers.setRunContext ?? noopSetRunContext,
    getRunContext: handlers.getRunContext ?? noopGetRunContext,
    clearRunContext: handlers.clearRunContext ?? noopClearRunContext,
    registerSessionSchedulerJob:
      handlers.registerSessionSchedulerJob ?? noopRegisterSessionSchedulerJob,
    registerSessionAction: handlers.registerSessionAction ?? noopRegisterSessionAction,
    sendSessionAttachment: handlers.sendSessionAttachment ?? noopSendSessionAttachment,
    scheduleSessionTurn: handlers.scheduleSessionTurn ?? noopScheduleSessionTurn,
    unscheduleSessionTurnsByTag:
      handlers.unscheduleSessionTurnsByTag ?? noopUnscheduleSessionTurnsByTag,
    registerDetachedTaskRuntime:
      handlers.registerDetachedTaskRuntime ?? noopRegisterDetachedTaskRuntime,
    registerMemoryCapability: handlers.registerMemoryCapability ?? noopRegisterMemoryCapability,
    registerMemoryPromptSection:
      handlers.registerMemoryPromptSection ?? noopRegisterMemoryPromptSection,
    registerMemoryPromptSupplement:
      handlers.registerMemoryPromptSupplement ?? noopRegisterMemoryPromptSupplement,
    registerMemoryCorpusSupplement:
      handlers.registerMemoryCorpusSupplement ?? noopRegisterMemoryCorpusSupplement,
    registerMemoryFlushPlan: handlers.registerMemoryFlushPlan ?? noopRegisterMemoryFlushPlan,
    registerMemoryRuntime: handlers.registerMemoryRuntime ?? noopRegisterMemoryRuntime,
    registerMemoryEmbeddingProvider:
      handlers.registerMemoryEmbeddingProvider ?? noopRegisterMemoryEmbeddingProvider,
    resolvePath: params.resolvePath,
    on: handlers.on ?? noopOn,
  };
  return attachPluginApiFacades(api);
}
