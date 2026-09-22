import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Scope, UnitOfWork } from '@intentra/shared';
import {
  AccountIdentity,
  CreateWorkspaceDto,
  WorkspaceDto,
} from '@intentra/workspace-contracts';

import {
  Membership,
  RoleAssignment,
} from '../../../../access/domain/entities/index.js';
import {
  MembershipRepository,
  RoleAssignmentRepository,
} from '../../../../access/domain/repositories/index.js';
import { WorkspaceRoles } from '../../../../access/domain/value-objects/index.js';
import { Workspace } from '../../../domain/entities/index.js';
import { WorkspaceRepository } from '../../../domain/repositories/index.js';
import { toWorkspaceDto } from '../workspace.mapper.js';

export class CreateWorkspaceCommand extends Command<WorkspaceDto> {
  constructor(
    public readonly payload: CreateWorkspaceDto,
    public readonly identity: AccountIdentity,
  ) {
    super();
  }
}

@CommandHandler(CreateWorkspaceCommand)
export class CreateWorkspaceCommandHandler implements ICommandHandler<CreateWorkspaceCommand> {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly workspaces: WorkspaceRepository,
    private readonly memberships: MembershipRepository,
    private readonly assignments: RoleAssignmentRepository,
  ) {}

  /**
   * Тенант, участие создателя и его роль владельца появляются вместе.
   *
   * Одной транзакцией, потому что порознь получаются состояния, которых по
   * правилам не бывает: workspace без владельца, из которого никто не может
   * ничего сделать, или роль, выданная тому, кто в тенанте не состоит (ADR 0002).
   * Прав спрашивающего здесь не проверяется: завести свой workspace может любой,
   * кто вошёл, — это действие принадлежит человеку, а не тенанту.
   */
  public async execute(command: CreateWorkspaceCommand): Promise<WorkspaceDto> {
    const { payload, identity } = command;

    const workspace = Workspace.create({ name: payload.name });
    const workspaceId = workspace.id.toString();

    await this.unitOfWork.run(async () => {
      await this.workspaces.save(workspace);
      await this.memberships.save(
        Membership.create({ workspaceId, accountId: identity.accountId }),
      );
      await this.assignments.save(
        RoleAssignment.create({
          workspaceId,
          accountId: identity.accountId,
          role: WorkspaceRoles.Owner,
          scope: Scope.workspace(workspaceId),
        }),
      );
    });

    return toWorkspaceDto(workspace);
  }
}
