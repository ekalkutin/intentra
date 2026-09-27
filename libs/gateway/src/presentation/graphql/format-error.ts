import { HttpStatus } from '@nestjs/common';
import type { GraphQLFormattedError } from 'graphql';

/** Set by GraphQL itself before a resolver runs, so the filter never sees them. */
const GRAPHQL_OWN_CODES = new Set([
  'GRAPHQL_PARSE_FAILED',
  'GRAPHQL_VALIDATION_FAILED',
  'BAD_USER_INPUT',
  'PERSISTED_QUERY_NOT_FOUND',
  'PERSISTED_QUERY_NOT_SUPPORTED',
  'OPERATION_RESOLUTION_FAILURE',
  'BAD_REQUEST',
]);

/** Gives GraphQL's own errors the same `extensions` as the filter's ones. */
export function formatGraphQLError(
  formatted: GraphQLFormattedError,
): GraphQLFormattedError {
  const code = formatted.extensions?.code;
  if (typeof code !== 'string' || !GRAPHQL_OWN_CODES.has(code)) {
    return formatted;
  }
  return {
    ...formatted,
    extensions: { code, status: HttpStatus.BAD_REQUEST, retryable: false },
  };
}
