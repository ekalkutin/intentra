import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AgentsModule } from '@intentra/agents';
import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { WorkspaceModule } from '@intentra/workspace';

import {
  EnvironmentSchema,
  Variables,
} from './infrastructure/config.schema.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validate: config => EnvironmentSchema.parse(config),
    }),
    GatewayModule.register({
      contexts: [
        IamModule.registerAsync({
          useFactory: (config: ConfigService<Variables, true>) => ({
            database: config.get('iam.database', { infer: true }),
          }),
          inject: [ConfigService],
        }),
        WorkspaceModule.registerAsync({
          useFactory: (config: ConfigService<Variables, true>) => ({
            database: config.get('workspace.database', { infer: true }),
          }),
          inject: [ConfigService],
        }),
        AgentsModule.registerAsync({
          useFactory: (config: ConfigService<Variables, true>) => ({
            database: config.get('agents.database', { infer: true }),
          }),
          inject: [ConfigService],
        }),
      ],
    }),
  ],
})
export class ServerModule {}
