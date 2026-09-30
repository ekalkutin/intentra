import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { GatewayModule, type GatewayModuleOptions } from '@intentra/gateway';
import { IamModule, type IamModuleOptions } from '@intentra/iam';
import { PersistenceModule } from '@intentra/platform-persistence';
import { WorkspaceModule } from '@intentra/workspace';

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

const workspace = WorkspaceModule.register({});

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
    GatewayModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<Variables, true>,
      ): GatewayModuleOptions => configService.get('gateway', { infer: true }),
      contexts: [iam, workspace],
    }),
  ],
})
export class ApiModule {}
