import type { AccountId, Email, WorkspaceId } from '@intentra/shared-kernel';

import { Member } from '../../../domain/entities/index.js';
import type {
  MemberId,
  MemberStatus,
  Role,
} from '../../../domain/value-objects/index.js';
import { MemberNotFoundException } from '../../exceptions/index.js';

export type MemberQueryProps = {
  readonly id?: MemberId;
  readonly workspaceId?: WorkspaceId;
  readonly accountId?: AccountId;
  readonly email?: Email;
  readonly status?: MemberStatus;
  readonly role?: Role;
};

export abstract class MemberRepository {
  abstract save(member: Member): Promise<void>;
  abstract findOne(props: MemberQueryProps): Promise<Member | null>;
  abstract findMany(props: MemberQueryProps): Promise<Member[]>;
  abstract deleteMany(props: {
    readonly workspaceId: WorkspaceId;
  }): Promise<void>;

  public async getOne(props: MemberQueryProps): Promise<Member> {
    const member = await this.findOne(props);
    if (!member) {
      throw new MemberNotFoundException();
    }

    return member;
  }
}
