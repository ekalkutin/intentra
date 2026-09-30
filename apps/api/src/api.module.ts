import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { GatewayModule } from '@intentra/gateway';
import { IamModule, type IamModuleOptions } from '@intentra/iam';
import { PersistenceModule } from '@intentra/platform-persistence';
import {
  WorkspaceModule,
  type WorkspaceModuleOptions,
} from '@intentra/workspace';

import {
  EnvironmentSchema,
  type Variables,
} from './infrastructure/config.schema.js';

const iam = IamModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (
    configService: ConfigService<Variables, true>,
  ): IamModuleOptions => configService.get('iam', { infer: true }),
});

const workspace = WorkspaceModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (
    configService: ConfigService<Variables, true>,
  ): WorkspaceModuleOptions => configService.get('workspace', { infer: true }),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: ['.env'],
      validate: config => EnvironmentSchema.parse(config),
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService<Variables, true>) => ({
        uri: configService.get('database.uri', { infer: true }),
        authSource: 'admin',
      }),
      inject: [ConfigService],
    }),
    PersistenceModule,
    GatewayModule.register({ contexts: [iam, workspace] }),
  ],
})
export class ApiModule {}
