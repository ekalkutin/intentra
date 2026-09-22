import { Module } from '@nestjs/common';

import { IAM_CONTROLLERS } from './presentation/iam/rest/index.js';
import { WORKSPACE_CONTROLLERS } from './presentation/workspace/rest/index.js';

/** Первый транспорт: REST. GraphQL встанет рядом третьим модулем, не вместо. */
@Module({
  controllers: [...IAM_CONTROLLERS, ...WORKSPACE_CONTROLLERS],
})
export class RestModule {}
