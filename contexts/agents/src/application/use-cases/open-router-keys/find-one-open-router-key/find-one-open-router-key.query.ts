import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import type { OpenRouterKeyDto } from '@intentra/contracts/agents';
import { WorkspaceId } from '@intentra/shared';

import { OpenRouterKeyRepository } from '../../../ports/index.js';

export class FindOneOpenRouterKeyQuery extends Query<OpenRouterKeyDto | null> {
  constructor(public readonly workspaceId: string) {
    super();
  }
}

@QueryHandler(FindOneOpenRouterKeyQuery)
export class FindOneOpenRouterKeyQueryHandler implements IQueryHandler<FindOneOpenRouterKeyQuery> {
  constructor(
    @Inject(OpenRouterKeyRepository)
    private readonly openRouterKeyRepository: OpenRouterKeyRepository,
  ) {}

  public async execute({
    workspaceId,
  }: FindOneOpenRouterKeyQuery): Promise<OpenRouterKeyDto | null> {
    const key = await this.openRouterKeyRepository.findByWorkspace(
      new WorkspaceId(workspaceId),
    );
    return key && { hint: key.key.hint, updatedAt: key.updatedAt.toString() };
  }
}
