import type { ChatRequestDto } from '@intentra/contracts/agents';

import type { AgentProfile } from '../../domain/entities/index.js';
import type { ApiKey } from '../../domain/value-objects/index.js';

export type AgentRun = {
  readonly orchestrator: AgentProfile;
  /** Whom the orchestrator may delegate to. */
  readonly specialists: readonly AgentProfile[];
  readonly apiKey: ApiKey;
  /** On whose behalf the tools run. */
  readonly accountId: string;
  readonly request: ChatRequestDto;
  readonly abortSignal?: AbortSignal;
};

/** Runs the agents of a workspace and streams the orchestrator's answer. */
export abstract class AgentRuntime {
  /** An AI SDK UI message stream, encoded as server-sent events. */
  abstract stream(run: AgentRun): Promise<ReadableStream<Uint8Array>>;
}
