import type { AuthInfo } from '@modelcontextprotocol/server';

import type { PersonalAccessTokenCallerDto } from '@intentra/contracts/workspace';

/** Where the caller travels inside the SDK's pass-through `AuthInfo`. */
const CALLER = Symbol('caller');

type CallerAuthInfo = AuthInfo & {
  readonly extra: { readonly [CALLER]: PersonalAccessTokenCallerDto };
};

/** Wraps an authenticated caller for `req.auth`, which the MCP SDK hands to the server factory. */
export function toAuthInfo(
  secret: string,
  caller: PersonalAccessTokenCallerDto,
): AuthInfo {
  const authInfo: CallerAuthInfo = {
    token: secret,
    clientId: caller.actor.accountId,
    scopes: [caller.level],
    extra: { [CALLER]: caller },
  };

  return authInfo;
}

export function readCaller(
  authInfo: AuthInfo | undefined,
): PersonalAccessTokenCallerDto | undefined {
  return (authInfo as CallerAuthInfo | undefined)?.extra[CALLER];
}
