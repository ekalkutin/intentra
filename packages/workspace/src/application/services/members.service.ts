import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type { MemberDto, MembersApi } from '@intentra/contracts/workspace';
import { UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import { Workspace } from '../../domain/entities/index.js';
import { MemberRemovalService } from '../../domain/services/index.js';
import { MemberId, MemberStatus } from '../../domain/value-objects/index.js';
import { AccessResolver } from '../access/index.js';
import {
  MemberNotFoundException,
  WorkspaceNotFoundException,
} from '../exceptions/index.js';
import { toMemberDto } from '../mappers/index.js';
import {
  MemberRepository,
  WorkspaceRepository,
} from '../ports/outbound/index.js';

@Injectable()
export class MembersService implements MembersApi {
  readonly #memberRemovalService = new MemberRemovalService();

  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly accessResolver: AccessResolver,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  public async list(actor: Actor, workspaceId: string): Promise<MemberDto[]> {
    const id = new WorkspaceId(workspaceId);
    await this.accessResolver.resolve(actor, id);
    const workspace = await this.getWorkspace(id);

    const members = await this.memberRepository.findMany({
      workspaceId: id,
      status: MemberStatus.Active,
    });

    return members.map(member => toMemberDto(member, workspace));
  }

  public async remove(
    actor: Actor,
    workspaceId: string,
    memberId: string,
  ): Promise<void> {
    const id = new WorkspaceId(workspaceId);
    const owner = await this.accessResolver.resolve(actor, id);

    await this.unitOfWork.run(async () => {
      const workspace = await this.getWorkspace(id);
      const member = await this.memberRepository.findOne({
        id: new MemberId(memberId),
        workspaceId: id,
        status: MemberStatus.Active,
      });
      if (!member) {
        throw new MemberNotFoundException();
      }

      this.#memberRemovalService.remove(workspace, owner, member);
      await this.memberRepository.save(member);
    });
  }

  public async leave(actor: Actor, workspaceId: string): Promise<void> {
    const id = new WorkspaceId(workspaceId);
    const member = await this.accessResolver.resolve(actor, id);

    await this.unitOfWork.run(async () => {
      const workspace = await this.getWorkspace(id);

      this.#memberRemovalService.leave(workspace, member);
      await this.memberRepository.save(member);
    });
  }

  private async getWorkspace(id: WorkspaceId): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({ id });
    if (!workspace) {
      throw new WorkspaceNotFoundException();
    }

    return workspace;
  }
}
