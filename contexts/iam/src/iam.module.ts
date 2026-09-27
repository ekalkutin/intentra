import { Inject, Module, type OnApplicationShutdown } from '@nestjs/common';

import { IamApi } from '@intentra/contracts/iam';

import { AccountsModule } from './accounts/index.js';
import { IamApiService } from './iam-api.service.js';
import {
  ConfigurableModuleClass,
  IAM_OPTIONS,
  type IamModuleOptions,
} from './iam.module-definition.js';
import {
  createIamDatabase,
  IamDatabase,
} from './infrastructure/database/iam-database.js';

@Module({
  imports: [AccountsModule],
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
  ],
  exports: [IamApi, IamDatabase],
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
