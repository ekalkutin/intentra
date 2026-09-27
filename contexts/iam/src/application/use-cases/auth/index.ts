import { Provider } from '@nestjs/common';

import {
  RefreshTokensCommand,
  RefreshTokensCommandHandler,
} from './refresh-tokens/refresh-tokens.command.js';
import {
  SignInAccountCommand,
  SignInAccountCommandHandler,
} from './sign-in-account/sign-in-account.command.js';
import {
  SignUpAccountCommand,
  SignUpAccountCommandHandler,
} from './sign-up-account/sign-up-account.command.js';
import {
  VerifyAccessTokenQuery,
  VerifyAccessTokenQueryHandler,
} from './verify-access-token/verify-access-token.query.js';

export {
  RefreshTokensCommand,
  SignInAccountCommand,
  SignUpAccountCommand,
  VerifyAccessTokenQuery,
};

export const AUTH_CQRS_HANDLERS: Provider[] = [
  SignUpAccountCommandHandler,
  SignInAccountCommandHandler,
  RefreshTokensCommandHandler,
  VerifyAccessTokenQueryHandler,
];
