import { Provider } from '@nestjs/common';

import { AUTH_CQRS_HANDLERS } from './auth/index.js';

export const CQRS_HANDLERS: Provider[] = [...AUTH_CQRS_HANDLERS];
