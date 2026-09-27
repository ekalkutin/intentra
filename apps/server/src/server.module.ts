import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AgentsModule } from '@intentra/agents';
import { IamApi } from '@intentra/contracts/iam';
import { WorkspaceApi } from '@intentra/contracts/workspace';
import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { WorkspaceModule } from '@intentra/workspace';

import {
  EnvironmentSchema,
  Variables,
} from './infrastructure/config.schema.js';

// One object per context: Nest shares a dynamic module only while it is the
// same object, and the agents need the same IAM and Workspace as the gateway.
const iam = IamModule.registerAsync({
  useFactory: (config: ConfigService<Variables, true>) =>
    config.get('jwt', { infer: true }),
  inject: [ConfigService],
});
const workspace = WorkspaceModule.register({});
const agents = AgentsModule.registerAsync({
  // The tools of the agents read other contexts on behalf of the person in
  // the chat (ADR-0002).
  imports: [iam, workspace],
  useFactory: (
    config: ConfigService<Variables, true>,
    iamApi: IamApi,
    workspaceApi: WorkspaceApi,
  ) => ({
    ...config.get('agents', { infer: true }),
    toolApis: { iam: iamApi, workspace: workspaceApi },
  }),
  inject: [ConfigService, IamApi, WorkspaceApi],
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validate: config => EnvironmentSchema.parse(config),
    }),
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService<Variables, true>) => ({
        uri: config.get('database.uri', { infer: true }),
        authSource: 'admin',
      }),
      inject: [ConfigService],
    }),
    GatewayModule.register({
      contexts: [iam, workspace, agents],
    }),
  ],
})
export class ServerModule {}
