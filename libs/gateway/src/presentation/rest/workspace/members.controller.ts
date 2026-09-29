import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import {
  ChangeRoleDtoSchema,
  WorkspaceApi,
  type ChangeRoleDto,
  type MemberDto,
} from '@intentra/contracts/workspace';

import { ActorGuard, CurrentActor } from '../auth/index.js';

@Controller('workspaces/:workspaceId')
@UseGuards(ActorGuard)
export class MembersController {
  constructor(@Inject(WorkspaceApi) private readonly workspace: WorkspaceApi) {}

  @Get('members')
  public async list(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
  ): Promise<MemberDto[]> {
    return this.workspace.members.list(actor, workspaceId);
  }

  @Delete('members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async remove(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
  ): Promise<void> {
    return this.workspace.members.remove(actor, workspaceId, memberId);
  }

  @Put('members/:memberId/role')
  public async changeRole(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Body({ schema: ChangeRoleDtoSchema }) data: ChangeRoleDto,
  ): Promise<MemberDto> {
    return this.workspace.members.changeRole(
      actor,
      workspaceId,
      memberId,
      data,
    );
  }

  @Post('leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async leave(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
  ): Promise<void> {
    return this.workspace.members.leave(actor, workspaceId);
  }
}
