import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import type {
  FindWorkspacesDto,
  WorkspaceDto,
} from '@intentra/contracts/workspace';
import { AccountId, WorkspaceId } from '@intentra/shared';

import { WorkspaceRepository } from '../../../ports/index.js';

export class FindManyWorkspacesQuery extends Query<WorkspaceDto[]> {
  constructor(
    public readonly accountId: string,
    public readonly filter: FindWorkspacesDto = {},
  ) {
    super();
  }
}

@QueryHandler(FindManyWorkspacesQuery)
export class FindManyWorkspacesQueryHandler implements IQueryHandler<FindManyWorkspacesQuery> {
  constructor(
    @Inject(WorkspaceRepository)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  public async execute({
    accountId,
    filter,
  }: FindManyWorkspacesQuery): Promise<WorkspaceDto[]> {
    const workspaces = await this.workspaceRepository.findByMember(
      new AccountId(accountId),
      filter.ids?.map(id => new WorkspaceId(id)),
    );
    return workspaces.map(workspace => ({
      id: workspace.id.value,
      name: workspace.name,
      alias: workspace.alias.value,
    }));
  }
}
