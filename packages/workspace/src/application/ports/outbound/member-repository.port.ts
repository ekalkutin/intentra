import type { AccountId, WorkspaceId } from '@intentra/shared-kernel';

import { Member } from '../../../domain/entities/index.js';
import type { MemberStatus } from '../../../domain/value-objects/index.js';

export type MemberQueryProps = {
  readonly workspaceId?: WorkspaceId;
  readonly accountId?: AccountId;
  readonly status?: MemberStatus;
};

export abstract class MemberRepository {
  abstract save(member: Member): Promise<void>;
  abstract findOne(props: MemberQueryProps): Promise<Member | null>;
  abstract findMany(props: MemberQueryProps): Promise<Member[]>;
}
