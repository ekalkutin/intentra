import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { z } from 'zod';

/** What the API answers every error with (`libs/gateway/src/presentation/rest/errors/wire-error.ts`). */
const WireErrorSchema = z.object({
  message: z.string(),
  code: z.string(),
  status: z.number(),
  retryable: z.boolean(),
});

/** Codes the client gives itself when no answer came. */
export const CLIENT_ERROR_CODES = {
  network: 'NETWORK_ERROR',
  unknown: 'UNKNOWN_ERROR',
} as const;

export type ApiError = {
  readonly code: string;
  readonly message: string;
};

/** A failed request's error, whatever RTK Query made of it. */
export function toApiError(
  error: FetchBaseQueryError | SerializedError | undefined,
): ApiError | null {
  if (!error) {
    return null;
  }
  if ('status' in error) {
    const wire = WireErrorSchema.safeParse(error.data);
    if (wire.success) {
      return { code: wire.data.code, message: wire.data.message };
    }
    if (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR') {
      return { code: CLIENT_ERROR_CODES.network, message: String(error.error) };
    }
  }

  return {
    code: CLIENT_ERROR_CODES.unknown,
    message: 'message' in error ? String(error.message) : 'Unknown error',
  };
}
