import type { TokenPair } from '@intentra/contracts/iam';

const UNAUTHORIZED = 401;

/**
 * What to do with a finished request:
 * - `done`: hand the result over as it is;
 * - `retry`: the session changed meanwhile (refreshed by another request or
 *   tab), so send it again with the new access token;
 * - `refresh`: its access token expired, so refresh the pair, then retry.
 */
export type AfterResponse = 'done' | 'retry' | 'refresh';

export function afterResponse(props: {
  readonly status: number | string | undefined;
  /** The pair the request was sent with; null when sent signed out. */
  readonly sentWith: TokenPair | null;
  /** The pair now, after it came back. */
  readonly current: TokenPair | null;
}): AfterResponse {
  const { status, sentWith, current } = props;
  // A request sent signed out (such as a sign-in with a wrong password) is
  // refused for what it said, not for an old token.
  if (status !== UNAUTHORIZED || !sentWith || !current) {
    return 'done';
  }

  return current.accessToken === sentWith.accessToken ? 'refresh' : 'retry';
}
