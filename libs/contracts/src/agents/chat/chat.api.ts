import type { ChatRequestDto } from './chat.dto.js';

export type ChatStreamParams = {
  readonly workspaceId: string;
  /** Who writes: the tools of the agents act on their behalf. */
  readonly accountId: string;
  readonly request: ChatRequestDto;
  /** Stops the models once the person has gone. */
  readonly abortSignal?: AbortSignal;
};

/**
 * A conversation with the orchestrator of a workspace. Reached through
 * `AgentsApi.chat`.
 */
export interface ChatApi {
  /**
   * The answer as an AI SDK UI message stream, already encoded as
   * server-sent events. What can fail before the answer starts fails here:
   * `OPEN_ROUTER_KEY_NOT_FOUND` (404) when the workspace has no key.
   */
  stream(params: ChatStreamParams): Promise<ReadableStream<Uint8Array>>;
}
