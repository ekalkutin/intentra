import { Module } from '@nestjs/common';

import { AgentsApi } from '@intentra/contracts/agents';

import { ConfigurableModuleClass } from './agents.module-defs.js';
import { APPLICATION_SERVICES } from './application/services/index.js';
import { ADAPTERS } from './infrastructure/adapters/index.js';
import { DatabaseModule } from './infrastructure/database/index.js';

@Module({
  imports: [DatabaseModule],
  providers: [...APPLICATION_SERVICES, ...ADAPTERS],
  exports: [AgentsApi],
})
export class AgentsModule extends ConfigurableModuleClass {}
