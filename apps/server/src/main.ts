import { StandardSchemaValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { ServerModule } from './server.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    ServerModule,
    {},
  );

  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.enableCors();
  app.useBodyParser('json', { limit: '1mb' });

  await app.listen(3000);
}

bootstrap();
