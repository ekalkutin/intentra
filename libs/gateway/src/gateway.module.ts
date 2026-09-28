import { Module } from '@nestjs/common';

import { ConfigurableModuleClass } from './gateway.module-defs.js';

@Module({})
export class GatewayModule extends ConfigurableModuleClass {}
