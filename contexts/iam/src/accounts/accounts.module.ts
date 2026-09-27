import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AccountRepository } from './application/account-repository.port.js';
import { AccountsService } from './application/accounts.service.js';
import { AuthService } from './application/auth.service.js';
import { AccountRepositoryAdapter } from './infrastructure/account-repository.adapter.js';
import {
  AccountModel,
  AccountSchema,
} from './infrastructure/account.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AccountModel.name,
        schema: AccountSchema,
      },
    ]),
  ],
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
