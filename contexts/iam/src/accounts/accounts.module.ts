import { Module } from '@nestjs/common';

import { AccountRepository } from './application/account-repository.port.js';
import { AccountsService } from './application/accounts.service.js';
import { AuthService } from './application/auth.service.js';
import { AccountRepositoryAdapter } from './infrastructure/account-repository.adapter.js';

@Module({
  providers: [
    AccountsService,
    AuthService,
    {
      provide: AccountRepository,
      useClass: AccountRepositoryAdapter,
    },
  ],
  exports: [AccountsService, AuthService],
})
export class AccountsModule {}
