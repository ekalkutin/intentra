import type { Actor } from '../../iam/index.js';

import type { ChangeRoleDto } from './change-role.dto.js';
import type { MemberDto } from './member.dto.js';

export abstract class MembersApi {
  abstract list(actor: Actor, workspaceId: string): Promise<MemberDto[]>;

  abstract remove(
    actor: Actor,
    workspaceId: string,
    memberId: string,
  ): Promise<void>;

  abstract leave(actor: Actor, workspaceId: string): Promise<void>;

  abstract changeRole(
    actor: Actor,
    workspaceId: string,
    memberId: string,
    data: ChangeRoleDto,
  ): Promise<MemberDto>;
}
