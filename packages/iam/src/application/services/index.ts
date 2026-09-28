import { Provider } from '@nestjs/common';

import { AccountsService } from './accounts.service.js';
import { AuthService } from './auth.service.js';

export { AccountsService, AuthService };

export const APPLICATION_SERVICES: Provider[] = [AccountsService, AuthService];
