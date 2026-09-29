import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import {
  AccountId,
  type ProjectId,
  type WorkspaceId,
} from '@intentra/shared-kernel';

import { Member, Project } from '../../domain/entities/index.js';
import { ProjectRoleResolutionService } from '../../domain/services/index.js';
import { MemberStatus, ProjectRole } from '../../domain/value-objects/index.js';
import { WorkspaceNotFoundException } from '../exceptions/index.js';
import {
  MemberRepository,
  ProjectRepository,
  ProjectRoleAssignmentRepository,
} from '../ports/outbound/index.js';

/** An active Member, a Project of their Workspace and their Project Role in it. */
export type ProjectMembership = {
  readonly member: Member;
  readonly project: Project;
  readonly projectRole: ProjectRole;
};

/** Actor → their active Member in a Workspace. */
@Injectable()
export class AccessResolver {
  readonly #projectRoleResolutionService = new ProjectRoleResolutionService();

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly projectRoleAssignmentRepository: ProjectRoleAssignmentRepository,
  ) {}

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

  /** For use cases scoped to one Project; an unknown Project is not found. */
  public async resolveInProject(
    actor: Actor,
    workspaceId: WorkspaceId,
    projectId: ProjectId,
  ): Promise<ProjectMembership> {
    const member = await this.resolve(actor, workspaceId);
    const project = await this.projectRepository.getOne({
      workspaceId,
      id: projectId,
    });
    const assignment = await this.projectRoleAssignmentRepository.findOne({
      projectId: project.id,
      memberId: member.id,
    });

    return {
      member,
      project,
      projectRole: this.#projectRoleResolutionService.resolve(
        member,
        assignment,
      ),
    };
  }
}
