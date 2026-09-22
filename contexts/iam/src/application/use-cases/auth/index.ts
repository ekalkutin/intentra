import { Provider } from '@nestjs/common';

import {
  RefreshTokenCommand,
  RefreshTokenCommandHandler,
} from './refresh-token/refresh-token.command.js';
import {
  SignInCommand,
  SignInCommandHandler,
} from './sign-in/sign-in.command.js';
import {
  SignUpCommand,
  SignUpCommandHandler,
} from './sign-up/sign-up.command.js';
import {
  VerifyAccessTokenQuery,
  VerifyAccessTokenQueryHandler,
} from './verify-access-token/verify-access-token.query.js';

export {
  RefreshTokenCommand,
  SignInCommand,
  SignUpCommand,
  VerifyAccessTokenQuery,
};

export const AUTH_CQRS_HANDLERS: Provider[] = [
  RefreshTokenCommandHandler,
  SignInCommandHandler,
  SignUpCommandHandler,
  VerifyAccessTokenQueryHandler,
];
