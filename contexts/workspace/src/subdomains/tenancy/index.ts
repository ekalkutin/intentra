import { Provider } from '@nestjs/common';

import { TENANCY_CQRS_HANDLERS } from './application/use-cases/index.js';
import { TENANCY_PERSISTENCE } from './infrastructure/persistence/index.js';

/** Всё, что субдомен тенанта вносит в модуль контекста. */
export const TENANCY_PROVIDERS: Provider[] = [
  ...TENANCY_CQRS_HANDLERS,
  ...TENANCY_PERSISTENCE,
];
