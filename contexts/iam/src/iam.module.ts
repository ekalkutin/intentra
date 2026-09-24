import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { IamApi } from '@intentra/iam-contracts';

import { AccountRepository } from './application/ports/index.js';
import {
  AccountsService,
  AuthService,
  IamApiService,
} from './application/services/index.js';
import { ConfigurableModuleClass } from './iam.module-defs.js';
import {
  AccountModel,
  AccountRepositoryAdapter,
  AccountSchema,
} from './infrastructure/repositories/account/index.js';

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
    {
      provide: IamApi,
      useClass: IamApiService,
    },
  ],
  exports: [IamApi],
})
export class IamModule extends ConfigurableModuleClass {}
