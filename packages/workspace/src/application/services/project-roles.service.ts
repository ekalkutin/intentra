import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type {
  ChangeProjectRoleDto,
  MemberProjectRoleDto,
  ProjectRolesApi,
} from '@intentra/contracts/workspace';
import { ProjectId, UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import { Member, Project } from '../../domain/entities/index.js';
import {
  ProjectRoleChangeService,
  ProjectRoleResolutionService,
} from '../../domain/services/index.js';
import {
  MemberId,
  MemberStatus,
  ProjectRole,
} from '../../domain/value-objects/index.js';
import { AccessResolver } from '../access/index.js';
import {
  MemberNotFoundException,
  ProjectNotFoundException,
} from '../exceptions/index.js';
import { toMemberProjectRoleDto } from '../mappers/index.js';
import {
  MemberRepository,
  ProjectRepository,
  ProjectRoleAssignmentRepository,
} from '../ports/outbound/index.js';

@Injectable()
export class ProjectRolesService implements ProjectRolesApi {
  readonly #projectRoleResolutionService = new ProjectRoleResolutionService();
  readonly #projectRoleChangeService = new ProjectRoleChangeService();

  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly accessResolver: AccessResolver,
    private readonly projectRepository: ProjectRepository,
    private readonly memberRepository: MemberRepository,
    private readonly projectRoleAssignmentRepository: ProjectRoleAssignmentRepository,
  ) {}

  public async list(
    actor: Actor,
    workspaceId: string,
    projectId: string,
  ): Promise<MemberProjectRoleDto[]> {
    const id = new WorkspaceId(workspaceId);
    await this.accessResolver.resolve(actor, id);
    const project = await this.getProject(id, projectId);

    const members = await this.memberRepository.findMany({
      workspaceId: id,
      status: MemberStatus.Active,
    });
    const assignments = await this.projectRoleAssignmentRepository.findMany({
      projectId: project.id,
    });

    return members.map(member => {
      const assignment =
        assignments.find(candidate => candidate.memberId.equals(member.id)) ??
        null;

      return toMemberProjectRoleDto(
        member,
        this.#projectRoleResolutionService.resolve(member, assignment),
      );
    });
  }

  public async change(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    memberId: string,
    data: ChangeProjectRoleDto,
  ): Promise<MemberProjectRoleDto> {
    const id = new WorkspaceId(workspaceId);

    return this.unitOfWork.run(async () => {
      const changer = await this.accessResolver.resolve(actor, id);
      const project = await this.getProject(id, projectId);
      const member = await this.getActiveMember(id, memberId);
      const changerAssignment =
        await this.projectRoleAssignmentRepository.findOne({
          projectId: project.id,
          memberId: changer.id,
        });
      const assignment = await this.projectRoleAssignmentRepository.findOne({
        projectId: project.id,
        memberId: member.id,
      });

      const changed = this.#projectRoleChangeService.change(
        project,
        changer,
        member,
        { role: ProjectRole.from(data.role), changerAssignment, assignment },
      );
      await this.projectRoleAssignmentRepository.save(changed);

      return toMemberProjectRoleDto(
        member,
        this.#projectRoleResolutionService.resolve(member, changed),
      );
    });
  }

  private async getProject(
    workspaceId: WorkspaceId,
    projectId: string,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      workspaceId,
      id: new ProjectId(projectId),
    });
    if (!project) {
      throw new ProjectNotFoundException();
    }

    return project;
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
}
