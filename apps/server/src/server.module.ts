import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { WorkspaceModule } from '@intentra/workspace';

import { EnvironmentSchema, type Variables } from './config/env.schema.js';
import { LOCAL_PROVIDERS } from './infrastructure/index.js';

/**
 * Модульный монолит: один процесс, контексты — модули Nest.
 *
 * Контексты импортируются **в шлюз**, а не сюда напрямую: так их
 * опубликованные порты попадают в тот же глобальный инжектор, где лежат связки
 * `LOCAL_PROVIDERS`, и `useExisting` находит, на что ссылаться.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validate: config => EnvironmentSchema.parse(config),
    }),
    GatewayModule.forRoot({
      imports: [
        IamModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService<Variables, true>) => ({
            database: config.get('database', { infer: true }).iam,
            security: config.get('security', { infer: true }),
          }),
        }),
        WorkspaceModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService<Variables, true>) => ({
            database: config.get('database', { infer: true }).workspace,
          }),
        }),
      ],
      providers: [...LOCAL_PROVIDERS],
    }),
  ],
})
export class ServerModule {}
