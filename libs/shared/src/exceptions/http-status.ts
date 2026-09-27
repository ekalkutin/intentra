/**
 * The HTTP statuses the exception hierarchy speaks in. Owned here so the
 * kernel has no framework dependency: a status is a number the gateway maps
 * onto its transport.
 */
export const HttpStatus = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatus = (typeof HttpStatus)[keyof typeof HttpStatus];
