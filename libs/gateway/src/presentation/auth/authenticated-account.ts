import type { AccountDto } from '@intentra/contracts/iam';

import type { AuthMethod } from './authentication.decorator.js';

/**
 * Who makes the request, set once the token is verified. Holds only what does
 * not depend on a workspace: roles inside a workspace are checked there.
 */
export type AuthenticatedAccount = AccountDto & {
  /** What the account proved itself with: an agent comes with a PAT. */
  readonly method: Exclude<AuthMethod, AuthMethod.None>;
};
