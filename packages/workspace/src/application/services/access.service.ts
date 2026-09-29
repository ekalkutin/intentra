import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type {
  AccessApi,
  WorkspaceAccessDto,
} from '@intentra/contracts/workspace';
import { WorkspaceId } from '@intentra/shared-kernel';

import { AccessResolver } from '../access/index.js';
import { toWorkspaceAccessDto } from '../mappers/index.js';
import {
  ProjectRepository,
  ProjectRoleAssignmentRepository,
} from '../ports/outbound/index.js';

@Injectable()
export class AccessService implements AccessApi {
  constructor(
    private readonly accessResolver: AccessResolver,
    private readonly projectRepository: ProjectRepository,
    private readonly projectRoleAssignmentRepository: ProjectRoleAssignmentRepository,
  ) {}

  public async get(
    actor: Actor,
    workspaceId: string,
  ): Promise<WorkspaceAccessDto> {
    const id = new WorkspaceId(workspaceId);
    const member = await this.accessResolver.resolve(actor, id);
    const projects = await this.projectRepository.findMany({ workspaceId: id });
    const assignments = await this.projectRoleAssignmentRepository.findMany({
      memberId: member.id,
    });

    return toWorkspaceAccessDto(member, projects, assignments);
  }
}
