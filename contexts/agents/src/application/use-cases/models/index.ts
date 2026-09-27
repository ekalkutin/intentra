import { Provider } from '@nestjs/common';

import {
  FindManyModelsQuery,
  FindManyModelsQueryHandler,
} from './find-many-models/find-many-models.query.js';

export { FindManyModelsQuery };

export const MODELS_CQRS_HANDLERS: Provider[] = [FindManyModelsQueryHandler];
