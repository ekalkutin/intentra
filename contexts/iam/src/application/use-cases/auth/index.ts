import { Provider } from '@nestjs/common';

import {
  RefreshCommand,
  RefreshCommandHandler,
} from './refresh/refresh.command.js';
import {
  SignInCommand,
  SignInCommandHandler,
} from './sign-in/sign-in.command.js';
import {
  SignUpCommand,
  SignUpCommandHandler,
} from './sign-up/sign-up.command.js';

export { RefreshCommand, SignInCommand, SignUpCommand };

export const AUTH_CQRS_HANDLERS: Provider[] = [
  SignUpCommandHandler,
  SignInCommandHandler,
  RefreshCommandHandler,
];
