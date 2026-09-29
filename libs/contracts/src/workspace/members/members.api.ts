import type { Actor } from '../../iam/index.js';

import type { MemberDto } from './member.dto.js';

export abstract class MembersApi {
  abstract list(actor: Actor, workspaceId: string): Promise<MemberDto[]>;
}
