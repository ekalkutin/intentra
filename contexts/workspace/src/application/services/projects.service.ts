import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import type {
  CreateProjectDto,
  ProjectDto,
  ProjectsApi,
} from '@intentra/contracts/workspace';

import {
  CreateProjectCommand,
  FindManyProjectsQuery,
  GetOneProjectQuery,
} from '../use-cases/projects/index.js';

@Injectable()
export class ProjectsService implements ProjectsApi {
  constructor(
    @Inject(CommandBus)
    private readonly commandBus: CommandBus,

    @Inject(QueryBus)
    private readonly queryBus: QueryBus,
  ) {}

  public async create(
    accountId: string,
    data: CreateProjectDto,
  ): Promise<ProjectDto> {
    const id = await this.commandBus.execute(
      new CreateProjectCommand(accountId, data),
    );
    return this.queryBus.execute(new GetOneProjectQuery(id));
  }

  public find(accountId: string): Promise<ProjectDto[]> {
    return this.queryBus.execute(new FindManyProjectsQuery(accountId));
  }
}
