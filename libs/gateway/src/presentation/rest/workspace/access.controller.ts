import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import {
  WorkspaceApi,
  type WorkspaceAccessDto,
} from '@intentra/contracts/workspace';

import { ActorGuard, CurrentActor } from '../auth/index.js';

@Controller('workspaces/:workspaceId/access')
@UseGuards(ActorGuard)
export class AccessController {
  constructor(@Inject(WorkspaceApi) private readonly workspace: WorkspaceApi) {}

  @Get()
  public async get(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
  ): Promise<WorkspaceAccessDto> {
    return this.workspace.access.get(actor, workspaceId);
  }
}
