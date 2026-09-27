import { AccountsResolver } from './accounts.resolver.js';
import { AuthResolver } from './auth.resolver.js';
import { PersonalAccessTokensResolver } from './personal-access-tokens.resolver.js';

export const IAM_GQL_RESOLVERS = [
  AccountsResolver,
  AuthResolver,
  PersonalAccessTokensResolver,
];
