import { Inject, Module, type OnApplicationShutdown } from '@nestjs/common';

import { IamApi } from '@intentra/contracts/iam';

import { AccountRepository } from './application/ports/account-repository.port.js';
import { AccountsService } from './application/services/accounts.service.js';
import { AuthService } from './application/services/auth.service.js';
import { IamApiService } from './iam-api.service.js';
import {
  ConfigurableModuleClass,
  IAM_OPTIONS,
  type IamModuleOptions,
} from './iam.module-definition.js';
import { AccountRepositoryAdapter } from './infrastructure/adapters/account-repository.adapter.js';
import {
  createIamDatabase,
  IamDatabase,
} from './infrastructure/database/iam-database.js';

@Module({
  providers: [
    {
      provide: IamApi,
      useClass: IamApiService,
    },
    {
      provide: IamDatabase,
      useFactory: (options: IamModuleOptions) =>
        createIamDatabase(options.database.url),
      inject: [IAM_OPTIONS],
    },
    AccountsService,
    AuthService,
    {
      provide: AccountRepository,
      useClass: AccountRepositoryAdapter,
    },
  ],
  exports: [IamApi],
})
export class IamModule
  extends ConfigurableModuleClass
  implements OnApplicationShutdown
{
  constructor(
    @Inject(IamDatabase)
    private readonly database: IamDatabase,
  ) {
    super();
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.database.close();
  }
}
