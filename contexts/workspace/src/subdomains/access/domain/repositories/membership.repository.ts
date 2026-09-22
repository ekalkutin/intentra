import { Membership } from '../entities/index.js';

export abstract class MembershipRepository {
  abstract save(membership: Membership): Promise<void>;
  abstract findOne(
    workspaceId: string,
    accountId: string,
  ): Promise<Membership | null>;
}
