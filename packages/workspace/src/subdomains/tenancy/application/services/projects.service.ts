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
import { toProjectDto } from '../mappers/index.js';
import {
  Cleanup,
  ProjectRepository,
  ProjectRoleAssignmentRepository,
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
    private readonly projectRoleAssignmentRepository: ProjectRoleAssignmentRepository,
    private readonly cleanup: Cleanup,
  ) {}

  public async create(
    actor: Actor,
    workspaceId: string,
    data: CreateProjectDto,
  ): Promise<ProjectDto> {
    const id = new WorkspaceId(workspaceId);

    return this.unitOfWork.run(async () => {
      await this.workspaceRepository.lock(id);
      const creator = await this.accessResolver.resolve(actor, id);
      const workspace = await this.workspaceRepository.getOne({ id });

      const { project, assignment } = this.#projectCreationService.create(
        workspace,
        creator,
        { name: data.name, slug: data.slug },
      );
      await this.projectRepository.save(project);
      await this.projectRoleAssignmentRepository.save(assignment);

      return toProjectDto(project);
    });
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

    await this.unitOfWork.run(async () => {
      await this.workspaceRepository.lock(id);
      const deleter = await this.accessResolver.resolve(actor, id);
      const workspace = await this.workspaceRepository.getOne({ id });
      const project = await this.projectRepository.getOne({
        workspaceId: id,
        id: new ProjectId(projectId),
      });

      this.#projectDeletionService.ensureDeletable(
        workspace,
        deleter,
        project,
        {
          slug: data.slug,
        },
      );
      await this.projectRepository.delete(project.id);
      await this.cleanup.afterProjectDeleted(project.id);
    });
  }
}
