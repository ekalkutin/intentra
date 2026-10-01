/** The Provider Key API's codes the page treats on its own, beyond showing their text. */
export const PROVIDER_KEY_ERROR_CODES = {
  /** The Workspace has no key yet: not a failure, the section offers to add one. */
  notFound: 'PROVIDER_KEY_NOT_FOUND',
} as const;

/** Codes that concern the key field rather than the whole form. */
export const KEY_FIELD_CODES = {
  INVALID_PROVIDER_KEY: 'key',
  PROVIDER_KEY_REJECTED: 'key',
} as const;
