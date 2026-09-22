import { Provider } from '@nestjs/common';

import { IamApiPort } from '../ports/index.js';

import { IamApiService } from './api.service.js';
import { AuthService } from './auth.service.js';
import { TokenIssuer } from './token-issuer.service.js';

export { AuthService, IamApiService, TokenIssuer };

export const APPLICATION_SERVICES: Provider[] = [
  AuthService,
  TokenIssuer,
  { provide: IamApiPort, useClass: IamApiService },
];
