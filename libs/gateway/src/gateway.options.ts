import type { MastraModelConfig } from '@mastra/core/llm';

export type GatewayModuleOptions = {
  /** What Intentra's own Agents run on; without it they answer 503 `AGENT_NOT_CONFIGURED`. */
  readonly agentModel?: MastraModelConfig | null;
};

/** In a file of its own, so that the gateway's modules inject it without an import cycle. */
export const GATEWAY_OPTIONS = Symbol('GATEWAY_OPTIONS');
