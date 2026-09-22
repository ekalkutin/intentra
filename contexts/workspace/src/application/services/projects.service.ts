import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import {
  CreateProjectDto,
  Identity,
  ProjectDto,
  ProjectsApi,
} from '@intentra/workspace-contracts';

import {
  CreateProjectCommand,
  FindProjectsQuery,
} from '../../subdomains/tenancy/application/use-cases/index.js';

@Injectable()
export class ProjectsService implements ProjectsApi {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  public async create(
    dto: CreateProjectDto,
    identity: Identity,
  ): Promise<ProjectDto> {
    return this.commandBus.execute(new CreateProjectCommand(dto, identity));
  }

  public async findMany(identity: Identity): Promise<ProjectDto[]> {
    return this.queryBus.execute(new FindProjectsQuery(identity));
  }
}
