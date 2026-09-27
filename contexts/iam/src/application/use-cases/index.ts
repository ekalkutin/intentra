import { Provider } from '@nestjs/common';

import { ACCOUNTS_CQRS_HANDLERS } from './accounts/index.js';
import { AUTH_CQRS_HANDLERS } from './auth/index.js';
import { PERSONAL_ACCESS_TOKENS_CQRS_HANDLERS } from './personal-access-tokens/index.js';

export const CQRS_HANDLERS: Provider[] = [
  ...ACCOUNTS_CQRS_HANDLERS,
  ...AUTH_CQRS_HANDLERS,
  ...PERSONAL_ACCESS_TOKENS_CQRS_HANDLERS,
];
