import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type {
  CreateProjectDto,
  DeleteProjectDto,
  ProjectDto,
  ProjectsApi,
} from '@intentra/contracts/workspace';
import { ProjectId, UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import {
  ProjectCreationService,
  ProjectDeletionService,
} from '../../domain/services/index.js';
import { AccessResolver } from '../access/index.js';
import {
  ProjectNotFoundException,
  WorkspaceNotFoundException,
} from '../exceptions/index.js';
import { toProjectDto } from '../mappers/index.js';
import {
  ProjectRepository,
  WorkspaceRepository,
} from '../ports/outbound/index.js';

@Injectable()
export class ProjectsService implements ProjectsApi {
  readonly #projectCreationService = new ProjectCreationService();
  readonly #projectDeletionService = new ProjectDeletionService();

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

  public async delete(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    data: DeleteProjectDto,
  ): Promise<void> {
    const id = new WorkspaceId(workspaceId);
    const owner = await this.accessResolver.resolve(actor, id);

    await this.unitOfWork.run(async () => {
      const workspace = await this.workspaceRepository.findOne({ id });
      if (!workspace) {
        throw new WorkspaceNotFoundException();
      }
      const project = await this.projectRepository.findOne({
        workspaceId: id,
        id: new ProjectId(projectId),
      });
      if (!project) {
        throw new ProjectNotFoundException();
      }

      this.#projectDeletionService.ensureDeletable(workspace, owner, project, {
        slug: data.slug,
      });
      await this.projectRepository.delete(project.id);
    });
  }
}
