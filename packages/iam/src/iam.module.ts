import { Module } from '@nestjs/common';

import { IamApi } from '@intentra/contracts/iam';

import { APPLICATION_SERVICES } from './application/services/index.js';
import { ConfigurableModuleClass } from './iam.module-defs.js';
import { ADAPTERS } from './infrastructure/adapters/index.js';
import { DatabaseModule } from './infrastructure/database/index.js';

@Module({
  imports: [DatabaseModule],
  providers: [...APPLICATION_SERVICES, ...ADAPTERS],
  exports: [IamApi],
})
export class IamModule extends ConfigurableModuleClass {}
