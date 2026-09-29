import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type { CallerDto } from '@intentra/contracts/workspace';
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

/**
 * An active Member, a Project of their Workspace and what they may do in it:
 * their Project Role, lowered to their token's level when an agent calls.
 */
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
    caller: CallerDto,
    workspaceId: WorkspaceId,
    projectId: ProjectId,
  ): Promise<ProjectMembership> {
    const member = await this.resolve(caller.actor, workspaceId);
    const project = await this.projectRepository.getOne({
      workspaceId,
      id: projectId,
    });
    const assignment = await this.projectRoleAssignmentRepository.findOne({
      projectId: project.id,
      memberId: member.id,
    });

    const projectRole = this.#projectRoleResolutionService.resolve(
      member,
      assignment,
    );

    return {
      member,
      project,
      projectRole: caller.agent
        ? projectRole.atMost(ProjectRole.from(caller.agent.level))
        : projectRole,
    };
  }
}
