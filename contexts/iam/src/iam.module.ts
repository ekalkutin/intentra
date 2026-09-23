import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AccountApi, AuthApi } from '@intentra/iam-contracts';

import { AccountRepository } from './application/ports/account-repository.port.js';
import { ConfigurableModuleClass } from './iam.module-defs.js';
import { IamService } from './iam.service.js';
import {
  AccountModel,
  AccountRepositoryAdapter,
  AccountSchema,
} from './infrastructure/repositories/account/index.js';
import { AccountApiAdapter } from './presentation/api/account.api-adapter.js';
import { AuthApiAdapter } from './presentation/api/auth.api-adapter.js';

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
    IamService,
    {
      provide: AccountRepository,
      useClass: AccountRepositoryAdapter,
    },
    {
      provide: AccountApi,
      useClass: AccountApiAdapter,
    },
    {
      provide: AuthApi,
      useClass: AuthApiAdapter,
    },
  ],
  exports: [AccountApi, AuthApi],
})
export class IamModule extends ConfigurableModuleClass {}
