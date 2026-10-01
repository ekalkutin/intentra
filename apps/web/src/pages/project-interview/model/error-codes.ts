/** The Conversations API's codes the pages treat on their own, beyond showing their text. */
export const CONVERSATION_ERROR_CODES = {
  notFound: 'CONVERSATION_NOT_FOUND',
  /** An answer is still running in it, perhaps one the Member stopped reading. */
  busy: 'CONVERSATION_BUSY',
} as const;
