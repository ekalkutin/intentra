import type {
  InvitationDto,
  InvitationStatusDto,
} from '@intentra/contracts/workspace';

import { Invitation, Workspace } from '../../domain/entities/index.js';

/** Mongo keeps milliseconds: a date must read the same before and after a round trip. */
const ISO_MILLISECONDS: Temporal.InstantToStringOptions = {
  smallestUnit: 'millisecond',
};

export function toInvitationDto(
  invitation: Invitation,
  workspace: Workspace,
): InvitationDto {
  return {
    id: invitation.id.value,
    workspaceId: invitation.workspaceId.value,
    workspaceName: workspace.name.value,
    email: invitation.email.value,
    status: invitation.status.value as InvitationStatusDto,
    sentAt: invitation.sentAt.toString(ISO_MILLISECONDS),
    expiresAt: invitation.expiresAt.toString(ISO_MILLISECONDS),
  };
}
