import type { Email, WorkspaceId } from '@intentra/shared-kernel';

import { Invitation } from '../../../domain/entities/index.js';
import type {
  InvitationId,
  InvitationStatus,
} from '../../../domain/value-objects/index.js';

export type InvitationQueryProps = {
  readonly id?: InvitationId;
  readonly workspaceId?: WorkspaceId;
  readonly email?: Email;
  readonly status?: InvitationStatus;
};

export abstract class InvitationRepository {
  abstract save(invitation: Invitation): Promise<void>;
  abstract findOne(props: InvitationQueryProps): Promise<Invitation | null>;
  abstract findMany(props: InvitationQueryProps): Promise<Invitation[]>;
  abstract deleteMany(props: {
    readonly workspaceId: WorkspaceId;
  }): Promise<void>;
}
