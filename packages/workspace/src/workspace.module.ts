import { Module } from '@nestjs/common';

import { WorkspaceApi } from '@intentra/contracts/workspace';

import { APPLICATION_SERVICES } from './application/services/index.js';
import { ADAPTERS } from './infrastructure/adapters/index.js';
import { DatabaseModule } from './infrastructure/database/index.js';
import { ConfigurableModuleClass } from './workspace.module-defs.js';

@Module({
  imports: [DatabaseModule],
  providers: [...APPLICATION_SERVICES, ...ADAPTERS],
  exports: [WorkspaceApi],
})
export class WorkspaceModule extends ConfigurableModuleClass {}
