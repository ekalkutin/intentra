import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';

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
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService<Variables, true>) => ({
        uri: config.get('database.uri', { infer: true }),
        authSource: 'admin',
      }),
      inject: [ConfigService],
    }),
    GatewayModule.register({
      contexts: [IamModule.register({})],
    }),
  ],
})
export class ServerModule {}
