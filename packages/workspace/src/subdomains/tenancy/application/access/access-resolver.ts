import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type { CallerDto, MemberCallerDto } from '@intentra/contracts/workspace';
import {
  AccountId,
  ProjectId,
  type WorkspaceId,
} from '@intentra/shared-kernel';

import { Member, Project } from '../../domain/entities/index.js';
import { ProjectRoleResolutionService } from '../../domain/services/index.js';
import { MemberStatus, ProjectRole } from '../../domain/value-objects/index.js';
import {
  IntentraCallerForbiddenException,
  ProjectNotFoundException,
  WorkspaceNotFoundException,
} from '../exceptions/index.js';
import {
  MemberRepository,
  ProjectRepository,
  ProjectRoleAssignmentRepository,
  WorkspaceRepository,
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

/**
 * A Project and what the caller may do in it: an active Member through
 * their Project Role, or Intentra itself, a Contributor with no Member.
 */
export type ProjectAccess = {
  /** Null for Intentra itself, in an Analysis Run. */
  readonly member: Member | null;
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
    private readonly workspaceRepository: WorkspaceRepository,
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

  /** Like `resolve`, for a use case that changes something: refused while the Workspace is suspended. */
  public async resolveForChange(
    actor: Actor,
    workspaceId: WorkspaceId,
  ): Promise<Member> {
    const member = await this.resolve(actor, workspaceId);
    await this.ensureChangeable(workspaceId);

    return member;
  }

  /** Like `resolveInProject`, for a use case that changes something: refused while the Workspace is suspended. */
  public async resolveInProjectForChange(
    caller: CallerDto,
    workspaceId: WorkspaceId,
    projectId: ProjectId,
  ): Promise<ProjectMembership> {
    const membership = await this.resolveInProject(
      caller,
      workspaceId,
      projectId,
    );
    await this.ensureChangeable(workspaceId);

    return membership;
  }

  /**
   * Like `resolveInProject`, for the use cases Intentra itself may call as
   * well (reading knowledge, recording an Open Question): it gets the
   * Project it runs in as a Contributor, with no Member.
   */
  public async resolveProjectAccess(
    caller: CallerDto,
    workspaceId: WorkspaceId,
    projectId: ProjectId,
  ): Promise<ProjectAccess> {
    if (caller.actor !== null) {
      return this.resolveInProject(caller, workspaceId, projectId);
    }
    if (!projectId.equals(new ProjectId(caller.agent.projectId))) {
      throw new ProjectNotFoundException();
    }
    const project = await this.projectRepository.getOne({
      workspaceId,
      id: projectId,
    });

    return {
      member: null,
      project,
      projectRole: ProjectRole.from(caller.agent.level),
    };
  }

  /** Like `resolveProjectAccess`, for a use case that changes something: refused while the Workspace is suspended. */
  public async resolveProjectAccessForChange(
    caller: CallerDto,
    workspaceId: WorkspaceId,
    projectId: ProjectId,
  ): Promise<ProjectAccess> {
    const access = await this.resolveProjectAccess(
      caller,
      workspaceId,
      projectId,
    );
    await this.ensureChangeable(workspaceId);

    return access;
  }

  /**
   * For use cases scoped to one Project; an unknown Project is not found, and
   * so is any Project but the one an agent is limited to. Intentra itself is
   * refused: it has no Member.
   */
  public async resolveInProject(
    caller: CallerDto,
    workspaceId: WorkspaceId,
    projectId: ProjectId,
  ): Promise<ProjectMembership> {
    const memberCaller = asMemberCaller(caller);
    const member = await this.resolve(memberCaller.actor, workspaceId);
    const agentProjectId = memberCaller.agent?.projectId;
    if (agentProjectId && !projectId.equals(new ProjectId(agentProjectId))) {
      throw new ProjectNotFoundException();
    }
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
      projectRole: memberCaller.agent
        ? projectRole.atMost(ProjectRole.from(memberCaller.agent.level))
        : projectRole,
    };
  }

  private async ensureChangeable(workspaceId: WorkspaceId): Promise<void> {
    const workspace = await this.workspaceRepository.getOne({
      id: workspaceId,
    });
    workspace.ensureChangeable();
  }
}

function asMemberCaller(caller: CallerDto): MemberCallerDto {
  if (caller.actor === null) {
    throw new IntentraCallerForbiddenException();
  }

  return caller;
}
