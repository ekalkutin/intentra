import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { CreateWorkspaceDto } from '@intentra/contracts/workspace';
import { AccountId } from '@intentra/shared';

import { Workspace } from '../../../../domain/entities/index.js';
import {
  WorkspaceAlias,
  WorkspaceName,
} from '../../../../domain/value-objects/index.js';
import { WorkspaceAliasAlreadyTakenException } from '../../../exceptions/index.js';
import { WorkspaceRepository } from '../../../ports/index.js';

export class CreateWorkspaceCommand extends Command<string> {
  constructor(
    public readonly accountId: string,
    public readonly payload: CreateWorkspaceDto,
  ) {
    super();
  }
}

@CommandHandler(CreateWorkspaceCommand)
export class CreateWorkspaceCommandHandler implements ICommandHandler<CreateWorkspaceCommand> {
  constructor(
    @Inject(WorkspaceRepository)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  public async execute({
    accountId,
    payload,
  }: CreateWorkspaceCommand): Promise<string> {
    const alias = new WorkspaceAlias(payload.alias);
    if (await this.workspaceRepository.findByAlias(alias)) {
      throw new WorkspaceAliasAlreadyTakenException();
    }

    const workspace = Workspace.create({
      name: new WorkspaceName(payload.name),
      alias,
      creator: new AccountId(accountId),
    });
    await this.workspaceRepository.save(workspace);
    return workspace.id.value;
  }
}
