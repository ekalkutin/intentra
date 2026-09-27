import { Module } from '@nestjs/common';

import { IamApi } from '@intentra/contracts/iam';

import { AccountsModule } from './accounts/index.js';
import { IamApiService } from './iam-api.service.js';
import { ConfigurableModuleClass } from './iam.module-definition.js';

@Module({
  imports: [AccountsModule],
  providers: [
    {
      provide: IamApi,
      useClass: IamApiService,
    },
  ],
  exports: [IamApi],
})
export class IamModule extends ConfigurableModuleClass {}
