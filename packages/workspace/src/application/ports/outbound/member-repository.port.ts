import type { AccountId } from '@intentra/shared-kernel';

import { Member } from '../../../domain/entities/index.js';
import type { MemberStatus } from '../../../domain/value-objects/index.js';

export type MemberQueryProps = {
  readonly accountId: AccountId;
  readonly status: MemberStatus;
};

export abstract class MemberRepository {
  abstract save(member: Member): Promise<void>;
  abstract findMany(props: MemberQueryProps): Promise<Member[]>;
}
