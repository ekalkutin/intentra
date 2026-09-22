import { Provider } from '@nestjs/common';

import { ACCESS_PERSISTENCE } from './infrastructure/persistence/index.js';

/** Всё, что субдомен доступа вносит в модуль контекста. */
export const ACCESS_SUBDOMAIN_PROVIDERS: Provider[] = [...ACCESS_PERSISTENCE];
