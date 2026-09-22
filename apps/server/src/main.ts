import 'reflect-metadata';

import { StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { type Variables } from './config/env.schema.js';
import { ServerModule } from './server.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(ServerModule);

  /* Схемы из контрактов проверяют тело запроса: контроллер пишет
     `@Body({ schema })`, и сообщение об ошибке — то же самое, что покажет
     браузеру его собственная проверка той же схемой. */
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.setGlobalPrefix('api');

  const config = app.get<ConfigService<Variables, true>>(ConfigService);
  const { port, webUrl } = config.get('http', { infer: true });

  app.enableCors({ origin: webUrl, credentials: true });

  await app.listen(port);
}

void bootstrap();
