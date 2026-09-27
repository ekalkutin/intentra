import { AccountLoader } from './account.loader.js';
import { AccountsResolver } from './accounts.resolver.js';
import { AuthResolver } from './auth.resolver.js';
import { PersonalAccessTokensResolver } from './personal-access-tokens.resolver.js';

export { AccountLoader } from './account.loader.js';

export const IAM_GQL_RESOLVERS = [
  AccountsResolver,
  AuthResolver,
  PersonalAccessTokensResolver,
];

export const IAM_GQL_LOADERS = [AccountLoader];
