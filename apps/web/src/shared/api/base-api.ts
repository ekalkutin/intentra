import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';

import type { RefreshTokensDto, TokenPair } from '@intentra/contracts/iam';

import { afterResponse } from './reauth';
import { sessionTokens } from './session-tokens';

const API_PREFIX = '/api';
const REFRESH_PATH = '/iam/auth/refresh';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_PREFIX,
  prepareHeaders: headers => {
    const tokens = sessionTokens.get();
    if (tokens) {
      headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    }
    return headers;
  },
});

/** One refresh at a time: requests that fail together wait for the same new pair. */
const refreshing = new Mutex();

/**
 * Sends a request with the session's access token. When it expired, refreshes
 * the pair once and sends the request again; when the refresh token expired
 * too, signs out, and the app takes the person to the sign-in page.
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await refreshing.waitForUnlock();
  const sentWith = sessionTokens.get();
  const result = await rawBaseQuery(args, api, extraOptions);

  const next = afterResponse({
    status: result.error?.status,
    sentWith,
    current: sessionTokens.get(),
  });
  if (next === 'done') {
    return result;
  }
  if (next === 'refresh') {
    await refreshing.runExclusive(async () => {
      const current = sessionTokens.get();
      // Another request refreshed the pair while this one waited.
      if (!current || current.accessToken !== sentWith?.accessToken) {
        return;
      }
      const body: RefreshTokensDto = { refreshToken: current.refreshToken };
      const refreshed = await rawBaseQuery(
        { url: REFRESH_PATH, method: 'POST', body },
        api,
        extraOptions,
      );
      if (refreshed.data) {
        sessionTokens.set(refreshed.data as TokenPair);
      } else {
        sessionTokens.clear();
      }
    });
  }

  return sessionTokens.get() ? rawBaseQuery(args, api, extraOptions) : result;
};

/**
 * The one API of the app. It has no endpoints of its own: each slice adds
 * those it owns with `injectEndpoints` (ADR 0003).
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});
