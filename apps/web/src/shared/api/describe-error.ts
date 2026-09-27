import { CombinedGraphQLErrors } from '@apollo/client/errors';

const UNAUTHORIZED_STATUS = 401;

export const describeError = (error: unknown, fallback: string): string =>
  CombinedGraphQLErrors.is(error)
    ? (error.errors[0]?.message ?? fallback)
    : 'Could not reach the server. Try again.';

/** No token, a bad one or an expired one: the gateway answers 401 under different codes. */
export const isUnauthorized = (error: unknown): boolean =>
  CombinedGraphQLErrors.is(error) &&
  error.errors.some(err => err.extensions?.status === UNAUTHORIZED_STATUS);
