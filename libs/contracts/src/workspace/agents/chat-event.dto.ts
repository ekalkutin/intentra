/**
 * One event of the streamed answer, sent as a server-sent event
 * (`data: <JSON>`). A stream ends with `finish`, or with `error` if it fails.
 */
export type ChatEventDto =
  | { readonly type: 'text-delta'; readonly text: string }
  | {
      readonly type: 'tool-call';
      readonly toolCallId: string;
      readonly toolName: string;
      readonly args: unknown;
    }
  | {
      readonly type: 'tool-result';
      readonly toolCallId: string;
      readonly toolName: string;
      /** A failed call gives the text the Orchestrator saw, such as `KNOWLEDGE_ITEM_CHANGED: …`. */
      readonly result: unknown;
      readonly isError: boolean;
    }
  | { readonly type: 'error'; readonly message: string; readonly code: string }
  | { readonly type: 'finish'; readonly finishReason: string };
