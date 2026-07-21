// Declares extension points for agent session type augmentation.
export type NodoAssistAgentSessionSkillSourceAugmentation = never;

declare module "nodoassist/plugin-sdk/agent-sessions" {
  interface Skill {
    // NodoAssist relies on the source identifier returned by skill loaders.
    source: string;
  }
}
