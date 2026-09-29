import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type {
  CreateWorkspaceDto,
  DeleteWorkspaceDto,
  TransferOwnershipDto,
  WorkspaceDto,
  WorkspacesApi,
} from '@intentra/contracts/workspace';
import { AccountId, UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import {
  OwnershipTransferService,
  WorkspaceCreationService,
  WorkspaceDeletionService,
} from '../../domain/services/index.js';
import { MemberId, MemberStatus } from '../../domain/value-objects/index.js';
import { AccessResolver } from '../access/index.js';
import {
  MemberNotFoundException,
  WorkspaceNotFoundException,
} from '../exceptions/index.js';
import { toWorkspaceDto } from '../mappers/index.js';
import {
  InvitationRepository,
  MemberRepository,
  ProjectRepository,
  WorkspaceRepository,
} from '../ports/outbound/index.js';

@Injectable()
export class WorkspacesService implements WorkspacesApi {
  readonly #workspaceCreationService = new WorkspaceCreationService();
  readonly #workspaceDeletionService = new WorkspaceDeletionService();
  readonly #ownershipTransferService = new OwnershipTransferService();

  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly accessResolver: AccessResolver,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly memberRepository: MemberRepository,
    private readonly invitationRepository: InvitationRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  public async create(
    actor: Actor,
    data: CreateWorkspaceDto,
  ): Promise<WorkspaceDto> {
    const { workspace, owner } = this.#workspaceCreationService.create({
      name: data.name,
      slug: data.slug,
      accountId: actor.accountId,
      email: actor.email,
    });

    await this.unitOfWork.run(async () => {
      await this.workspaceRepository.save(workspace);
      await this.memberRepository.save(owner);
    });

    return toWorkspaceDto(workspace);
  }

  public async list(actor: Actor): Promise<WorkspaceDto[]> {
    const members = await this.memberRepository.findMany({
      accountId: new AccountId(actor.accountId),
      status: MemberStatus.Active,
    });
    const workspaces = await this.workspaceRepository.findMany({
      ids: members.map(member => member.workspaceId),
    });

    return workspaces.map(toWorkspaceDto);
  }

  public async delete(
    actor: Actor,
    workspaceId: string,
    data: DeleteWorkspaceDto,
  ): Promise<void> {
    const id = new WorkspaceId(workspaceId);
    const owner = await this.accessResolver.resolve(actor, id);

    await this.unitOfWork.run(async () => {
      const workspace = await this.workspaceRepository.findOne({ id });
      if (!workspace) {
        throw new WorkspaceNotFoundException();
      }

      this.#workspaceDeletionService.ensureDeletable(workspace, owner, {
        slug: data.slug,
      });
      await this.projectRepository.deleteMany({ workspaceId: id });
      await this.invitationRepository.deleteMany({ workspaceId: id });
      await this.memberRepository.deleteMany({ workspaceId: id });
      await this.workspaceRepository.delete(id);
    });
  }

  public async transferOwnership(
    actor: Actor,
    workspaceId: string,
    data: TransferOwnershipDto,
  ): Promise<void> {
    const id = new WorkspaceId(workspaceId);
    const owner = await this.accessResolver.resolve(actor, id);

    await this.unitOfWork.run(async () => {
      const workspace = await this.workspaceRepository.findOne({ id });
      if (!workspace) {
        throw new WorkspaceNotFoundException();
      }
      const newOwner = await this.memberRepository.findOne({
        id: new MemberId(data.memberId),
        workspaceId: id,
        status: MemberStatus.Active,
      });
      if (!newOwner) {
        throw new MemberNotFoundException();
      }

      this.#ownershipTransferService.transfer(workspace, owner, newOwner);
      await this.workspaceRepository.save(workspace);
    });
  }
}
