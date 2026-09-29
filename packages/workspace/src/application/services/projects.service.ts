import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type {
  CreateProjectDto,
  ProjectDto,
  ProjectsApi,
} from '@intentra/contracts/workspace';
import { UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import { ProjectCreationService } from '../../domain/services/index.js';
import { AccessResolver } from '../access/index.js';
import { WorkspaceNotFoundException } from '../exceptions/index.js';
import { toProjectDto } from '../mappers/index.js';
import {
  ProjectRepository,
  WorkspaceRepository,
} from '../ports/outbound/index.js';

@Injectable()
export class ProjectsService implements ProjectsApi {
  readonly #projectCreationService = new ProjectCreationService();

  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly accessResolver: AccessResolver,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  public async create(
    actor: Actor,
    workspaceId: string,
    data: CreateProjectDto,
  ): Promise<ProjectDto> {
    const id = new WorkspaceId(workspaceId);
    const member = await this.accessResolver.resolve(actor, id);
    const workspace = await this.workspaceRepository.findOne({ id });
    if (!workspace) {
      throw new WorkspaceNotFoundException();
    }

    const project = this.#projectCreationService.create(workspace, member, {
      name: data.name,
      slug: data.slug,
    });
    await this.unitOfWork.run(() => this.projectRepository.save(project));

    return toProjectDto(project);
  }

  public async list(actor: Actor, workspaceId: string): Promise<ProjectDto[]> {
    const id = new WorkspaceId(workspaceId);
    await this.accessResolver.resolve(actor, id);
    const projects = await this.projectRepository.findMany({ workspaceId: id });

    return projects.map(toProjectDto);
  }
}
