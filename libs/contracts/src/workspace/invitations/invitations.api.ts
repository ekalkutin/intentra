import type { Actor } from '../../iam/index.js';

import type { CreateInvitationDto } from './create-invitation.dto.js';
import type { InvitationDto } from './invitation.dto.js';

export abstract class InvitationsApi {
  abstract create(
    actor: Actor,
    workspaceId: string,
    data: CreateInvitationDto,
  ): Promise<InvitationDto>;

  abstract list(actor: Actor, workspaceId: string): Promise<InvitationDto[]>;
  abstract revoke(
    actor: Actor,
    workspaceId: string,
    invitationId: string,
  ): Promise<InvitationDto>;

  abstract listReceived(actor: Actor): Promise<InvitationDto[]>;
  abstract getReceived(
    actor: Actor,
    invitationId: string,
  ): Promise<InvitationDto>;

  abstract accept(actor: Actor, invitationId: string): Promise<InvitationDto>;
  abstract decline(actor: Actor, invitationId: string): Promise<InvitationDto>;

  /** Whether the email has a pending Invitation to some Workspace, so it may sign up while Open Sign-up is off. */
  abstract hasPending(email: string): Promise<boolean>;
}
