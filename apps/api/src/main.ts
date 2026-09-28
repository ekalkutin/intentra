import { StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { ApiModule } from './api.module.js';
import type { Variables } from './infrastructure/config.schema.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(ApiModule, {});

  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.enableCors();
  app.useBodyParser('json', { limit: '1mb' });

  const configService = app.get(ConfigService<Variables, true>);
  await app.listen(configService.get('listen.port', { infer: true }));
}

bootstrap();
