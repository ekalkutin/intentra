import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { CreateProjectDto } from '@intentra/contracts/workspace';
import { AccountId, WorkspaceId } from '@intentra/shared';

import { Project } from '../../../../domain/entities/index.js';
import { WorkspaceNotFoundException } from '../../../exceptions/index.js';
import {
  ProjectRepository,
  WorkspaceRepository,
} from '../../../ports/index.js';

export class CreateProjectCommand extends Command<string> {
  constructor(
    public readonly accountId: string,
    public readonly payload: CreateProjectDto,
  ) {
    super();
  }
}

@CommandHandler(CreateProjectCommand)
export class CreateProjectCommandHandler implements ICommandHandler<CreateProjectCommand> {
  constructor(
    @Inject(ProjectRepository)
    private readonly projectRepository: ProjectRepository,

    @Inject(WorkspaceRepository)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  public async execute({
    accountId,
    payload,
  }: CreateProjectCommand): Promise<string> {
    const workspace = await this.workspaceRepository.getById(
      new WorkspaceId(payload.workspaceId),
    );
    if (!workspace.hasMember(new AccountId(accountId))) {
      throw new WorkspaceNotFoundException(payload.workspaceId);
    }

    const project = Project.create({
      workspaceId: workspace.id,
      name: payload.name,
      description: payload.description,
    });
    await this.projectRepository.save(project);
    return project.id.value;
  }
}
