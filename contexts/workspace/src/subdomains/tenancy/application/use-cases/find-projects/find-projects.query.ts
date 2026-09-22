import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import { Identity, ProjectDto } from '@intentra/workspace-contracts';

import { AccessResolver } from '../../../../../application/access/index.js';
import { ProjectRepository } from '../../../domain/repositories/index.js';
import { toProjectDto } from '../workspace.mapper.js';

export class FindProjectsQuery extends Query<ProjectDto[]> {
  constructor(public readonly identity: Identity) {
    super();
  }
}

@QueryHandler(FindProjectsQuery)
export class FindProjectsQueryHandler implements IQueryHandler<FindProjectsQuery> {
  constructor(
    private readonly access: AccessResolver,
    private readonly projects: ProjectRepository,
  ) {}

  /**
   * Список сужается в запросе к базе, а не обрезается после выборки: обрезание
   * забывают, а выборку — нет. Владелец видит все проекты workspace, участник —
   * только те, на которые ему выдана роль.
   */
  public async execute(query: FindProjectsQuery): Promise<ProjectDto[]> {
    const member = await this.access.resolve(query.identity);

    const found = await this.projects.findManyInWorkspace(
      query.identity.workspaceId,
      member.isOmnipotent ? undefined : member.reachableProjectIds,
    );

    return found.map(toProjectDto);
  }
}
