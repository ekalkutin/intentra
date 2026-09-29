import type { AccountId, Email, WorkspaceId } from '@intentra/shared-kernel';

import { Member } from '../../../domain/entities/index.js';
import type {
  MemberId,
  MemberStatus,
} from '../../../domain/value-objects/index.js';

export type MemberQueryProps = {
  readonly id?: MemberId;
  readonly workspaceId?: WorkspaceId;
  readonly accountId?: AccountId;
  readonly email?: Email;
  readonly status?: MemberStatus;
};

export abstract class MemberRepository {
  abstract save(member: Member): Promise<void>;
  abstract findOne(props: MemberQueryProps): Promise<Member | null>;
  abstract findMany(props: MemberQueryProps): Promise<Member[]>;
  abstract deleteMany(props: {
    readonly workspaceId: WorkspaceId;
  }): Promise<void>;
}
