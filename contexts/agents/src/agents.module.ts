import { Module } from '@nestjs/common';

import { ConfigurableModuleClass } from './agents.module-definition.js';

@Module({})
export class AgentsModule extends ConfigurableModuleClass {}
