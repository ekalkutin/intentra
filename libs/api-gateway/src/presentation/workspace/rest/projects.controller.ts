import { Body, Controller, Get, Post } from '@nestjs/common';

import {
  CreateProjectSchema,
  type CreateProjectDto,
  type Identity,
  type ProjectDto,
} from '@intentra/workspace-contracts';

import { WorkspaceClientPort } from '../../../application/ports/index.js';
import { RequestIdentity } from '../../../infrastructure/common/decorators/index.js';

/**
 * Проекты адресуются через свой workspace: `workspaceId` стоит в пути, и его
 * оттуда берёт `WorkspaceGuard`. Поэтому в DTO его нет — назвать один workspace
 * в адресе и другой в теле невозможно.
 */
@Controller('workspaces/:workspaceId/projects')
export class ProjectsController {
  constructor(private readonly workspace: WorkspaceClientPort) {}

  @Get()
  public async findMany(
    @RequestIdentity() identity: Identity,
  ): Promise<ProjectDto[]> {
    return this.workspace.projects.findMany(identity);
  }

  @Post()
  public async create(
    @Body({ schema: CreateProjectSchema }) dto: CreateProjectDto,
    @RequestIdentity() identity: Identity,
  ): Promise<ProjectDto> {
    return this.workspace.projects.create(dto, identity);
  }
}
