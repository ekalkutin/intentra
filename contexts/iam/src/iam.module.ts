import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AccountRepository } from './application/ports/account-repository.port.js';
import { ConfigurableModuleClass, OPTIONS_TYPE } from './iam.module-defs.js';
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
export class IamModule extends ConfigurableModuleClass {
  static override register(options: typeof OPTIONS_TYPE): DynamicModule {
    const { host, name, username, password } = options.database;
    const module = super.register(options);

    return {
      ...module,
      imports: [
        ...(module.imports ?? []),
        MongooseModule.forRoot(`mongodb://${host}:27017/${name}`, {
          auth: { username, password },
          authSource: 'admin',
        }),
      ],
    };
  }
}
