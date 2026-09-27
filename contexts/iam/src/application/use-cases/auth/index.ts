import { Provider } from '@nestjs/common';

import {
  SignUpCommand,
  SignUpCommandHandler,
} from './sign-up/sign-up.command.js';

export { SignUpCommand };

export const AUTH_CQRS_HANDLERS: Provider[] = [SignUpCommandHandler];
