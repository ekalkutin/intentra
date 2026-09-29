import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type {
  CreateInvitationDto,
  InvitationDto,
  InvitationsApi,
} from '@intentra/contracts/workspace';
import {
  AccountId,
  Email,
  UnitOfWork,
  WorkspaceId,
} from '@intentra/shared-kernel';

import { Invitation, Member, Workspace } from '../../domain/entities/index.js';
import { NotWorkspaceOwnerException } from '../../domain/exceptions/index.js';
import {
  InvitationAcceptanceService,
  InvitationSendingService,
} from '../../domain/services/index.js';
import {
  InvitationId,
  InvitationStatus,
} from '../../domain/value-objects/index.js';
import { AccessResolver } from '../access/index.js';
import {
  InvitationNotFoundException,
  WorkspaceNotFoundException,
} from '../exceptions/index.js';
import { toInvitationDto } from '../mappers/index.js';
import {
  InvitationRepository,
  MemberRepository,
  WorkspaceRepository,
} from '../ports/outbound/index.js';

@Injectable()
export class InvitationsService implements InvitationsApi {
  readonly #invitationSendingService = new InvitationSendingService();
  readonly #invitationAcceptanceService = new InvitationAcceptanceService();

  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly accessResolver: AccessResolver,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly memberRepository: MemberRepository,
    private readonly invitationRepository: InvitationRepository,
  ) {}

  public async create(
    actor: Actor,
    workspaceId: string,
    data: CreateInvitationDto,
  ): Promise<InvitationDto> {
    const id = new WorkspaceId(workspaceId);
    const email = new Email(data.email);
    const inviter = await this.accessResolver.resolve(actor, id);

    return this.unitOfWork.run(async () => {
      const workspace = await this.getWorkspace(id);
      const invitee = await this.memberRepository.findOne({
        workspaceId: id,
        email,
      });
      const existing = await this.invitationRepository.findOne({
        workspaceId: id,
        email,
      });

      const invitation = this.#invitationSendingService.send(
        workspace,
        inviter,
        { email: email.value, invitee, existing },
      );
      await this.invitationRepository.save(invitation);

      return toInvitationDto(invitation, workspace);
    });
  }

  public async list(
    actor: Actor,
    workspaceId: string,
  ): Promise<InvitationDto[]> {
    const id = new WorkspaceId(workspaceId);
    const member = await this.accessResolver.resolve(actor, id);
    this.ensureOwner(member);
    const workspace = await this.getWorkspace(id);

    const invitations = await this.invitationRepository.findMany({
      workspaceId: id,
    });

    return invitations.map(invitation =>
      toInvitationDto(invitation, workspace),
    );
  }

  public async revoke(
    actor: Actor,
    workspaceId: string,
    invitationId: string,
  ): Promise<InvitationDto> {
    const id = new WorkspaceId(workspaceId);
    const member = await this.accessResolver.resolve(actor, id);

    return this.unitOfWork.run(async () => {
      this.ensureOwner(member);
      const workspace = await this.getWorkspace(id);
      const invitation = await this.invitationRepository.findOne({
        id: new InvitationId(invitationId),
        workspaceId: id,
      });
      if (!invitation) {
        throw new InvitationNotFoundException();
      }

      invitation.revoke();
      await this.invitationRepository.save(invitation);

      return toInvitationDto(invitation, workspace);
    });
  }

  public async listReceived(actor: Actor): Promise<InvitationDto[]> {
    const invitations = await this.invitationRepository.findMany({
      email: new Email(actor.email),
      status: InvitationStatus.Pending,
    });
    const pending = invitations.filter(invitation => invitation.isPending());
    const workspaces = await this.workspaceRepository.findMany({
      ids: pending.map(invitation => invitation.workspaceId),
    });

    return pending.flatMap(invitation => {
      const workspace = workspaces.find(workspace =>
        workspace.id.equals(invitation.workspaceId),
      );

      return workspace ? [toInvitationDto(invitation, workspace)] : [];
    });
  }

  public async getReceived(
    actor: Actor,
    invitationId: string,
  ): Promise<InvitationDto> {
    const invitation = await this.getReceivedInvitation(actor, invitationId);
    const workspace = await this.getWorkspace(invitation.workspaceId);

    return toInvitationDto(invitation, workspace);
  }

  public async accept(
    actor: Actor,
    invitationId: string,
  ): Promise<InvitationDto> {
    return this.unitOfWork.run(async () => {
      const invitation = await this.getReceivedInvitation(actor, invitationId);
      const workspace = await this.getWorkspace(invitation.workspaceId);
      const member = await this.memberRepository.findOne({
        workspaceId: invitation.workspaceId,
        accountId: new AccountId(actor.accountId),
      });

      const joined = this.#invitationAcceptanceService.accept(invitation, {
        accountId: actor.accountId,
        member,
      });
      await this.invitationRepository.save(invitation);
      await this.memberRepository.save(joined);

      return toInvitationDto(invitation, workspace);
    });
  }

  public async decline(
    actor: Actor,
    invitationId: string,
  ): Promise<InvitationDto> {
    return this.unitOfWork.run(async () => {
      const invitation = await this.getReceivedInvitation(actor, invitationId);
      const workspace = await this.getWorkspace(invitation.workspaceId);

      invitation.decline();
      await this.invitationRepository.save(invitation);

      return toInvitationDto(invitation, workspace);
    });
  }

  /** Someone else's Invitation is reported as missing, not as forbidden. */
  private async getReceivedInvitation(
    actor: Actor,
    invitationId: string,
  ): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      id: new InvitationId(invitationId),
    });
    if (!invitation?.isAddressedTo(new Email(actor.email))) {
      throw new InvitationNotFoundException();
    }

    return invitation;
  }

  private async getWorkspace(id: WorkspaceId): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({ id });
    if (!workspace) {
      throw new WorkspaceNotFoundException();
    }

    return workspace;
  }

  private ensureOwner(member: Member): void {
    if (!member.isOwner()) {
      throw new NotWorkspaceOwnerException();
    }
  }
}
