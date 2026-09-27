import { Inject, Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import type { ModelDto, ModelsApi } from '@intentra/contracts/agents';

import { FindManyModelsQuery } from '../use-cases/models/index.js';

@Injectable()
export class ModelsService implements ModelsApi {
  constructor(
    @Inject(QueryBus)
    private readonly queryBus: QueryBus,
  ) {}

  public find(): Promise<ModelDto[]> {
    return this.queryBus.execute(new FindManyModelsQuery());
  }
}
