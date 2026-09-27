import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { UpdateWorkspaceDto } from '@intentra/contracts/workspace';
import { AccountId, WorkspaceId } from '@intentra/shared';

import { WorkspaceName } from '../../../../domain/value-objects/index.js';
import { WorkspaceNotFoundException } from '../../../exceptions/index.js';
import { WorkspaceRepository } from '../../../ports/index.js';

/** The alias is left alone: it is the workspace's address, and links use it. */
export class UpdateWorkspaceCommand extends Command<string> {
  constructor(
    public readonly accountId: string,
    public readonly id: string,
    public readonly payload: UpdateWorkspaceDto,
  ) {
    super();
  }
}

@CommandHandler(UpdateWorkspaceCommand)
export class UpdateWorkspaceCommandHandler implements ICommandHandler<UpdateWorkspaceCommand> {
  constructor(
    @Inject(WorkspaceRepository)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  public async execute({
    accountId,
    id,
    payload,
  }: UpdateWorkspaceCommand): Promise<string> {
    const workspace = await this.workspaceRepository.getById(
      new WorkspaceId(id),
    );
    if (!workspace.hasMember(new AccountId(accountId))) {
      throw new WorkspaceNotFoundException(id);
    }

    workspace.rename(new WorkspaceName(payload.name));
    await this.workspaceRepository.save(workspace);
    return workspace.id.value;
  }
}
