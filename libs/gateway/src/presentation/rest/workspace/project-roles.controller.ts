import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import {
  ChangeProjectRoleDtoSchema,
  WorkspaceApi,
  type ChangeProjectRoleDto,
  type MemberProjectRoleDto,
} from '@intentra/contracts/workspace';

import { ActorGuard, CurrentActor } from '../auth/index.js';

@Controller('workspaces/:workspaceId/projects/:projectId/roles')
@UseGuards(ActorGuard)
export class ProjectRolesController {
  constructor(@Inject(WorkspaceApi) private readonly workspace: WorkspaceApi) {}

  @Get()
  public async list(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
  ): Promise<MemberProjectRoleDto[]> {
    return this.workspace.projectRoles.list(actor, workspaceId, projectId);
  }

  @Put(':memberId')
  public async change(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Body({ schema: ChangeProjectRoleDtoSchema }) data: ChangeProjectRoleDto,
  ): Promise<MemberProjectRoleDto> {
    return this.workspace.projectRoles.change(
      actor,
      workspaceId,
      projectId,
      memberId,
      data,
    );
  }
}
