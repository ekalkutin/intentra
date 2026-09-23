import { Module } from '@nestjs/common';

import { ConfigurableModuleClass } from './gateway.module-definition.js';

@Module({})
export class GatewayModule extends ConfigurableModuleClass {}
