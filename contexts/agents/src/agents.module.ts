import { Module } from '@nestjs/common';

import { ConfigurableModuleClass } from './agents.module-definition.js';
import { ProfilesModule } from './profiles/index.js';

@Module({
  imports: [ProfilesModule],
})
export class AgentsModule extends ConfigurableModuleClass {}
