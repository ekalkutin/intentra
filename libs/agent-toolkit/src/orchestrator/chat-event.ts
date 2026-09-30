import type { ChunkType } from '@mastra/core/stream';
import { isValidationError } from '@mastra/core/tools';

import type { ChatEventDto } from '@intentra/contracts/workspace';

/** What the client is told when the Orchestrator itself fails; the cause stays in the logs. */
export const AGENT_FAILED: Extract<ChatEventDto, { type: 'error' }> = {
  type: 'error',
  code: 'AGENT_FAILED',
  message: 'The Orchestrator could not answer. Try again later',
};

/**
 * The client's view of one chunk of the Orchestrator's stream, or null for a
 * chunk it does not need (steps, reasoning, partial tool input).
 */
export function toChatEvent<Output>(
  chunk: ChunkType<Output>,
): ChatEventDto | null {
  switch (chunk.type) {
    case 'text-delta':
      return { type: 'text-delta', text: chunk.payload.text };
    case 'tool-call':
      return {
        type: 'tool-call',
        toolCallId: chunk.payload.toolCallId,
        toolName: chunk.payload.toolName,
        args: chunk.payload.args ?? {},
      };
    case 'tool-result':
      return {
        type: 'tool-result',
        toolCallId: chunk.payload.toolCallId,
        toolName: chunk.payload.toolName,
        result: chunk.payload.result,
        // Invalid input or context is returned, not thrown.
        isError:
          chunk.payload.isError === true ||
          isValidationError(chunk.payload.result),
      };
    // A tool threw: the model got the error's message and carries on.
    case 'tool-error':
      return {
        type: 'tool-result',
        toolCallId: chunk.payload.toolCallId,
        toolName: chunk.payload.toolName,
        result:
          chunk.payload.error instanceof Error
            ? chunk.payload.error.message
            : String(chunk.payload.error),
        isError: true,
      };
    case 'error':
      return AGENT_FAILED;
    case 'finish':
      return {
        type: 'finish',
        finishReason: chunk.payload.stepResult.reason,
      };
    default:
      return null;
  }
}
