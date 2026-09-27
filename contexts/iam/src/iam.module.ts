import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { IamApi } from '@intentra/contracts/iam';

import { AccountRepository } from './application/ports/account-repository.port.js';
import { AccountsService } from './application/services/accounts.service.js';
import { AuthService } from './application/services/auth.service.js';
import { CQRS_HANDLERS } from './application/use-cases/index.js';
import { IamApiService } from './iam-api.service.js';
import { ConfigurableModuleClass } from './iam.module-definition.js';
import { AccountRepositoryAdapter } from './infrastructure/adapters/account-repository.adapter.js';
import {
  AccountModel,
  AccountSchema,
} from './infrastructure/database/account.schema.js';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: AccountModel.name,
        schema: AccountSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: IamApi,
      useClass: IamApiService,
    },
    ...CQRS_HANDLERS,
    AccountsService,
    AuthService,
    {
      provide: AccountRepository,
      useClass: AccountRepositoryAdapter,
    },
  ],
  exports: [IamApi],
})
export class IamModule extends ConfigurableModuleClass {}
