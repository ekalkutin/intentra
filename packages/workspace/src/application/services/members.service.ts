import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type {
  ChangeRoleDto,
  MemberDto,
  MembersApi,
} from '@intentra/contracts/workspace';
import { UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import { Member, Workspace } from '../../domain/entities/index.js';
import {
  MemberRemovalService,
  RoleChangeService,
} from '../../domain/services/index.js';
import {
  MemberId,
  MemberStatus,
  Role,
} from '../../domain/value-objects/index.js';
import { AccessResolver } from '../access/index.js';
import {
  MemberNotFoundException,
  WorkspaceNotFoundException,
} from '../exceptions/index.js';
import { toMemberDto } from '../mappers/index.js';
import {
  MemberRepository,
  PersonalAccessTokenRepository,
  ProjectRoleAssignmentRepository,
  WorkspaceRepository,
} from '../ports/outbound/index.js';

@Injectable()
export class MembersService implements MembersApi {
  readonly #memberRemovalService = new MemberRemovalService();
  readonly #roleChangeService = new RoleChangeService();

  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly accessResolver: AccessResolver,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly memberRepository: MemberRepository,
    private readonly projectRoleAssignmentRepository: ProjectRoleAssignmentRepository,
    private readonly personalAccessTokenRepository: PersonalAccessTokenRepository,
  ) {}

  public async list(actor: Actor, workspaceId: string): Promise<MemberDto[]> {
    const id = new WorkspaceId(workspaceId);
    await this.accessResolver.resolve(actor, id);

    const members = await this.memberRepository.findMany({
      workspaceId: id,
      status: MemberStatus.Active,
    });

    return members.map(toMemberDto);
  }

  public async remove(
    actor: Actor,
    workspaceId: string,
    memberId: string,
  ): Promise<void> {
    const id = new WorkspaceId(workspaceId);

    await this.unitOfWork.run(async () => {
      await this.workspaceRepository.lock(id);
      const remover = await this.accessResolver.resolve(actor, id);
      const workspace = await this.getWorkspace(id);
      const member = await this.getActiveMember(id, memberId);
      const owners = await this.findOwners(id);

      this.#memberRemovalService.remove(workspace, remover, member, { owners });
      await this.memberRepository.save(member);
      await this.projectRoleAssignmentRepository.deleteMany({
        memberId: member.id,
      });
      await this.personalAccessTokenRepository.deleteMany({
        memberId: member.id,
      });
    });
  }

  public async leave(actor: Actor, workspaceId: string): Promise<void> {
    const id = new WorkspaceId(workspaceId);

    await this.unitOfWork.run(async () => {
      await this.workspaceRepository.lock(id);
      const member = await this.accessResolver.resolve(actor, id);
      const workspace = await this.getWorkspace(id);
      const owners = await this.findOwners(id);

      this.#memberRemovalService.leave(workspace, member, { owners });
      await this.memberRepository.save(member);
      await this.projectRoleAssignmentRepository.deleteMany({
        memberId: member.id,
      });
      await this.personalAccessTokenRepository.deleteMany({
        memberId: member.id,
      });
    });
  }

  public async changeRole(
    actor: Actor,
    workspaceId: string,
    memberId: string,
    data: ChangeRoleDto,
  ): Promise<MemberDto> {
    const id = new WorkspaceId(workspaceId);

    return this.unitOfWork.run(async () => {
      await this.workspaceRepository.lock(id);
      const changer = await this.accessResolver.resolve(actor, id);
      const workspace = await this.getWorkspace(id);
      const member = await this.getActiveMember(id, memberId);
      const owners = await this.findOwners(id);

      this.#roleChangeService.change(workspace, changer, member, {
        role: data.role === null ? null : Role.from(data.role),
        owners,
      });
      await this.memberRepository.save(member);

      return toMemberDto(member);
    });
  }

  private async getActiveMember(
    workspaceId: WorkspaceId,
    memberId: string,
  ): Promise<Member> {
    const member = await this.memberRepository.findOne({
      id: new MemberId(memberId),
      workspaceId,
      status: MemberStatus.Active,
    });
    if (!member) {
      throw new MemberNotFoundException();
    }

    return member;
  }

  private findOwners(workspaceId: WorkspaceId): Promise<Member[]> {
    return this.memberRepository.findMany({
      workspaceId,
      status: MemberStatus.Active,
      role: Role.Owner,
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
