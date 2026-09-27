import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import type { ModelDto } from '@intentra/contracts/agents';

import { ModelCatalog } from '../../../ports/index.js';

export class FindManyModelsQuery extends Query<ModelDto[]> {}

@QueryHandler(FindManyModelsQuery)
export class FindManyModelsQueryHandler implements IQueryHandler<FindManyModelsQuery> {
  constructor(
    @Inject(ModelCatalog)
    private readonly modelCatalog: ModelCatalog,
  ) {}

  public async execute(): Promise<ModelDto[]> {
    const models = await this.modelCatalog.find();
    return models.map(model => ({
      id: model.id,
      name: model.name,
      contextLength: model.contextLength,
    }));
  }
}
