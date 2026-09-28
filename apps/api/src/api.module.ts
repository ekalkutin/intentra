import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { GatewayModule } from '@intentra/gateway';
import { IamModule, type IamModuleOptions } from '@intentra/iam';

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
    GatewayModule.register({ contexts: [iam] }),
  ],
})
export class ApiModule {}
