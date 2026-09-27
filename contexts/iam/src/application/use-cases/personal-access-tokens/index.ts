import { Provider } from '@nestjs/common';

import {
  CreatePersonalAccessTokenCommand,
  CreatePersonalAccessTokenCommandHandler,
} from './create-personal-access-token/create-personal-access-token.command.js';
import {
  FindManyPersonalAccessTokensQuery,
  FindManyPersonalAccessTokensQueryHandler,
} from './find-many-personal-access-tokens/find-many-personal-access-tokens.query.js';
import {
  GetOnePersonalAccessTokenQuery,
  GetOnePersonalAccessTokenQueryHandler,
} from './get-one-personal-access-token/get-one-personal-access-token.query.js';
import {
  RevokePersonalAccessTokenCommand,
  RevokePersonalAccessTokenCommandHandler,
} from './revoke-personal-access-token/revoke-personal-access-token.command.js';
import {
  VerifyPersonalAccessTokenQuery,
  VerifyPersonalAccessTokenQueryHandler,
} from './verify-personal-access-token/verify-personal-access-token.query.js';

export {
  CreatePersonalAccessTokenCommand,
  FindManyPersonalAccessTokensQuery,
  GetOnePersonalAccessTokenQuery,
  RevokePersonalAccessTokenCommand,
  VerifyPersonalAccessTokenQuery,
};

export const PERSONAL_ACCESS_TOKENS_CQRS_HANDLERS: Provider[] = [
  CreatePersonalAccessTokenCommandHandler,
  RevokePersonalAccessTokenCommandHandler,
  GetOnePersonalAccessTokenQueryHandler,
  FindManyPersonalAccessTokensQueryHandler,
  VerifyPersonalAccessTokenQueryHandler,
];
