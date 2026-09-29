import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import { AccountId, type WorkspaceId } from '@intentra/shared-kernel';

import { Member } from '../../domain/entities/index.js';
import { MemberStatus } from '../../domain/value-objects/index.js';
import { WorkspaceNotFoundException } from '../exceptions/index.js';
import { MemberRepository } from '../ports/outbound/index.js';

/** Actor → their active Member in a Workspace. */
@Injectable()
export class AccessResolver {
  constructor(private readonly memberRepository: MemberRepository) {}

  public resolveOrNull(
    actor: Actor,
    workspaceId: WorkspaceId,
  ): Promise<Member | null> {
    return this.memberRepository.findOne({
      workspaceId,
      accountId: new AccountId(actor.accountId),
      status: MemberStatus.Active,
    });
  }

  public async resolve(
    actor: Actor,
    workspaceId: WorkspaceId,
  ): Promise<Member> {
    const member = await this.resolveOrNull(actor, workspaceId);
    if (!member) {
      throw new WorkspaceNotFoundException();
    }

    return member;
  }
}
