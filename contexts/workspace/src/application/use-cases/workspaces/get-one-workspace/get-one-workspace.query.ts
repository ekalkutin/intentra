import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import type { WorkspaceDto } from '@intentra/contracts/workspace';
import { AccountId, WorkspaceId } from '@intentra/shared';

import { WorkspaceNotFoundException } from '../../../exceptions/index.js';
import { WorkspaceRepository } from '../../../ports/index.js';

export class GetOneWorkspaceQuery extends Query<WorkspaceDto> {
  constructor(
    public readonly accountId: string,
    public readonly id: string,
  ) {
    super();
  }
}

@QueryHandler(GetOneWorkspaceQuery)
export class GetOneWorkspaceQueryHandler implements IQueryHandler<GetOneWorkspaceQuery> {
  constructor(
    @Inject(WorkspaceRepository)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  public async execute({
    accountId,
    id,
  }: GetOneWorkspaceQuery): Promise<WorkspaceDto> {
    const workspace = await this.workspaceRepository.getById(
      new WorkspaceId(id),
    );
    if (!workspace.hasMember(new AccountId(accountId))) {
      throw new WorkspaceNotFoundException(id);
    }
    return {
      id: workspace.id.value,
      name: workspace.name.value,
      alias: workspace.alias.value,
      memberIds: workspace.members.map(member => member.value),
    };
  }
}
