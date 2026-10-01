import { Provider } from '@nestjs/common';

import { AccountsService } from './accounts.service.js';
import { AuthService } from './auth.service.js';
import { SignUpService } from './sign-up.service.js';

export { AccountsService, AuthService, SignUpService };

export const APPLICATION_SERVICES: Provider[] = [
  AccountsService,
  AuthService,
  SignUpService,
];
