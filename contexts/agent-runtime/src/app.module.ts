import { Module } from '@nestjs/common';

import { PERSISTENCE_PROVIDERS } from './infrastructure/persistence/index.js';
import {
  USERS_CONTROLLERS,
  USERS_PROVIDERS,
} from './subdomains/users/index.js';

@Module({
  controllers: [...USERS_CONTROLLERS],
  providers: [...PERSISTENCE_PROVIDERS, ...USERS_PROVIDERS],
})
export class AppModule {}
