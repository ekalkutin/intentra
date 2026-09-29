import { Invitation, Member, Workspace } from '../entities/index.js';
import {
  AlreadyWorkspaceMemberException,
  MemberNotActiveException,
  MemberNotInWorkspaceException,
  NotWorkspaceOwnerException,
} from '../exceptions/index.js';

import { AccessPolicyService } from './access-policy.service.js';

export class InvitationSendingService {
  readonly #accessPolicyService = new AccessPolicyService();

  public send(
    workspace: Workspace,
    inviter: Member,
    props: InvitationSendingProps,
  ): Invitation {
    if (!inviter.belongsTo(workspace.id)) {
      throw new MemberNotInWorkspaceException();
    }
    if (!inviter.isActive()) {
      throw new MemberNotActiveException();
    }
    if (!this.#accessPolicyService.canManageInvitations(inviter)) {
      throw new NotWorkspaceOwnerException();
    }
    if (props.invitee?.isActive()) {
      throw new AlreadyWorkspaceMemberException();
    }

    if (props.existing) {
      props.existing.reopen(inviter.id);

      return props.existing;
    }

    return Invitation.create({
      workspaceId: workspace.id.value,
      email: props.email,
      invitedBy: inviter.id.value,
    });
  }
}

type InvitationSendingProps = {
  readonly email: string;
  readonly invitee: Member | null;
  readonly existing: Invitation | null;
};
