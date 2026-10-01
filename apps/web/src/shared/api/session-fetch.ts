import type { RefreshTokensDto, TokenPair } from '@intentra/contracts/iam';

import { API_PREFIX, REFRESH_PATH } from './paths';
import { afterResponse } from './reauth';
import { refreshing } from './refreshing';
import { sessionTokens } from './session-tokens';

function withToken(init: RequestInit | undefined, pair: TokenPair | null) {
  const headers = new Headers(init?.headers);
  if (pair) {
    headers.set('Authorization', `Bearer ${pair.accessToken}`);
  }
  return { ...init, headers };
}

/** Refreshes the pair once for every request that found it expired; signs out when the refresh token expired too. */
async function refresh(sentWith: TokenPair | null): Promise<void> {
  await refreshing.runExclusive(async () => {
    const current = sessionTokens.get();
    // Another request refreshed the pair while this one waited.
    if (!current || current.accessToken !== sentWith?.accessToken) {
      return;
    }
    const body: RefreshTokensDto = { refreshToken: current.refreshToken };
    const response = await fetch(`${API_PREFIX}${REFRESH_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      sessionTokens.set((await response.json()) as TokenPair);
    } else {
      sessionTokens.clear();
    }
  });
}

/**
 * `fetch` with the session's access token, for requests RTK Query does not
 * make (such as a streamed answer): an expired token is refreshed once and
 * the request sent again, as `baseApi` does.
 */
export const sessionFetch: typeof fetch = async (input, init) => {
  await refreshing.waitForUnlock();
  const sentWith = sessionTokens.get();
  const response = await fetch(input, withToken(init, sentWith));
  const next = afterResponse({
    status: response.status,
    sentWith,
    current: sessionTokens.get(),
  });
  if (next === 'done') {
    return response;
  }
  if (next === 'refresh') {
    await refresh(sentWith);
  }
  const pair = sessionTokens.get();

  return pair ? fetch(input, withToken(init, pair)) : response;
};
