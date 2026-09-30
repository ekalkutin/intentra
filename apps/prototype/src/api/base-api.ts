import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import type { AppDispatch, RootState } from '@/app/store';
import {
  selectRefreshToken,
  signedOut,
  tokensReceived,
} from '@/features/auth/auth-slice';
import type { TokenPair } from '@intentra/contracts/iam';

export const API_BASE = '/api';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

let refreshing: Promise<boolean> | null = null;

/**
 * Exchanges the refresh token for a new pair, once for all callers that hit a
 * 401 at the same time. Signs out when the refresh token is no longer good.
 */
export function refreshTokens(
  getState: () => unknown,
  dispatch: AppDispatch,
): Promise<boolean> {
  refreshing ??= (async () => {
    const refreshToken = selectRefreshToken(getState() as RootState);
    if (!refreshToken) return false;
    try {
      const response = await fetch(`${API_BASE}/iam/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) {
        dispatch(signedOut());
        return false;
      }
      dispatch(tokensReceived((await response.json()) as TokenPair));
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshing = null;
  });

  return refreshing;
}

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === 'string' ? args : args.url;
  if (result.error?.status === 401 && !url.startsWith('/iam/auth/')) {
    const refreshed = await refreshTokens(
      api.getState,
      api.dispatch as AppDispatch,
    );
    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Me',
    'Workspace',
    'Access',
    'Member',
    'Invitation',
    'ReceivedInvitation',
    'Project',
    'ProjectRole',
    'Token',
    'Knowledge',
  ],
  endpoints: () => ({}),
});
