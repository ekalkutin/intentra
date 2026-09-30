/** The Knowledge API's error codes the pages treat on their own, beyond showing their text. */
export const KNOWLEDGE_ERROR_CODES = {
  notFound: 'KNOWLEDGE_ITEM_NOT_FOUND',
  /** Someone changed the item since the client read it. */
  changed: 'KNOWLEDGE_ITEM_CHANGED',
} as const;
