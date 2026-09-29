import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import { WorkspaceApi, type MemberDto } from '@intentra/contracts/workspace';

import { ActorGuard, CurrentActor } from '../auth/index.js';

@Controller('workspaces/:workspaceId/members')
@UseGuards(ActorGuard)
export class MembersController {
  constructor(@Inject(WorkspaceApi) private readonly workspace: WorkspaceApi) {}

  @Get()
  public async list(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
  ): Promise<MemberDto[]> {
    return this.workspace.members.list(actor, workspaceId);
  }
}
