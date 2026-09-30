import type {
  InvitationDto,
  InvitationStatusDto,
} from '@intentra/contracts/workspace';

import { Invitation, Workspace } from '../../domain/entities/index.js';

import { toIsoString } from './instant.mapper.js';

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
    sentAt: toIsoString(invitation.sentAt),
    expiresAt: toIsoString(invitation.expiresAt),
  };
}
