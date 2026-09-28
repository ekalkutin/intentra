import type { AccountsApi } from './account/accounts.api.js';
import type { AuthApi } from './auth/auth.api.js';

export abstract class IamApi {
  abstract readonly accounts: AccountsApi;
  abstract readonly auth: AuthApi;
}
