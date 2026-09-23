import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AccountRepository } from './application/ports/account-repository.port.js';
import { ConfigurableModuleClass } from './iam.module-definition.js';
import { IamService } from './iam.service.js';
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
    IamService,
    {
      provide: AccountRepository,
      useClass: AccountRepositoryAdapter,
    },
  ],
})
export class IamModule extends ConfigurableModuleClass {}
