import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  CreateProjectDto,
  Identity,
  ProjectDto,
} from '@intentra/workspace-contracts';

import {
  AccessPolicy,
  AccessResolver,
} from '../../../../../application/access/index.js';
import { Permissions } from '../../../../access/domain/value-objects/index.js';
import { Project } from '../../../domain/entities/index.js';
import { ProjectRepository } from '../../../domain/repositories/index.js';
import { toProjectDto } from '../workspace.mapper.js';

export class CreateProjectCommand extends Command<ProjectDto> {
  constructor(
    public readonly payload: CreateProjectDto,
    public readonly identity: Identity,
  ) {
    super();
  }
}

@CommandHandler(CreateProjectCommand)
export class CreateProjectCommandHandler implements ICommandHandler<CreateProjectCommand> {
  constructor(
    private readonly access: AccessResolver,
    private readonly policy: AccessPolicy,
    private readonly projects: ProjectRepository,
  ) {}

  public async execute(command: CreateProjectCommand): Promise<ProjectDto> {
    const { payload, identity } = command;

    const member = await this.access.resolve(identity);
    this.policy.require(member, Permissions.ProjectsCreate);

    const project = Project.create({
      workspaceId: identity.workspaceId,
      name: payload.name,
    });

    await this.projects.save(project);

    return toProjectDto(project);
  }
}
