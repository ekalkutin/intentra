import type { AccountsApi } from './account/accounts.api.js';
import type { AuthApi } from './auth/auth.api.js';

/** Published API of IAM. The class is the DI token for its grouped APIs. */
export abstract class IamApi {
  abstract readonly accounts: AccountsApi;
  abstract readonly auth: AuthApi;
}
