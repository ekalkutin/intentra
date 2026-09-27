import { Provider } from '@nestjs/common';

import { AUTH_CQRS_HANDLERS } from './auth/index.js';
import { PERSONAL_ACCESS_TOKENS_CQRS_HANDLERS } from './personal-access-tokens/index.js';

export const CQRS_HANDLERS: Provider[] = [
  ...AUTH_CQRS_HANDLERS,
  ...PERSONAL_ACCESS_TOKENS_CQRS_HANDLERS,
];
