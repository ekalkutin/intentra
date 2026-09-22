import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import { AccountIdentity, WorkspaceDto } from '@intentra/workspace-contracts';

import { WorkspaceRepository } from '../../../domain/repositories/index.js';
import { toWorkspaceDto } from '../workspace.mapper.js';

export class FindMyWorkspacesQuery extends Query<WorkspaceDto[]> {
  constructor(public readonly identity: AccountIdentity) {
    super();
  }
}

@QueryHandler(FindMyWorkspacesQuery)
export class FindMyWorkspacesQueryHandler implements IQueryHandler<FindMyWorkspacesQuery> {
  constructor(private readonly workspaces: WorkspaceRepository) {}

  /** Те, в которых человек состоит. Пустой список — обычный ответ: так выглядит только что зарегистрировавшийся. */
  public async execute(query: FindMyWorkspacesQuery): Promise<WorkspaceDto[]> {
    const found = await this.workspaces.findByMember(query.identity.accountId);

    return found.map(toWorkspaceDto);
  }
}
