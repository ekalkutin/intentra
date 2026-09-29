import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type { MemberDto, MembersApi } from '@intentra/contracts/workspace';
import { WorkspaceId } from '@intentra/shared-kernel';

import { MemberStatus } from '../../domain/value-objects/index.js';
import { AccessResolver } from '../access/index.js';
import { WorkspaceNotFoundException } from '../exceptions/index.js';
import { toMemberDto } from '../mappers/index.js';
import {
  MemberRepository,
  WorkspaceRepository,
} from '../ports/outbound/index.js';

@Injectable()
export class MembersService implements MembersApi {
  constructor(
    private readonly accessResolver: AccessResolver,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  public async list(actor: Actor, workspaceId: string): Promise<MemberDto[]> {
    const id = new WorkspaceId(workspaceId);
    await this.accessResolver.resolve(actor, id);
    const workspace = await this.workspaceRepository.findOne({ id });
    if (!workspace) {
      throw new WorkspaceNotFoundException();
    }

    const members = await this.memberRepository.findMany({
      workspaceId: id,
      status: MemberStatus.Active,
    });

    return members.map(member => toMemberDto(member, workspace));
  }
}
