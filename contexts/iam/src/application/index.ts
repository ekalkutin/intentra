import { Provider } from '@nestjs/common';

import { AUTH_CQRS_HANDLERS } from './use-cases/auth/index.js';

export { APPLICATION_SERVICES } from './services/index.js';

export const CQRS_HANDLERS: Provider[] = [...AUTH_CQRS_HANDLERS];
