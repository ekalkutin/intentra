import { Body, Controller, Get, Inject, Post } from '@nestjs/common';

import {
  CreateWorkspaceDtoSchema,
  WorkspaceApi,
  WorkspaceDto,
  type CreateWorkspaceDto,
} from '@intentra/contracts/workspace';

import { CurrentAccount, type AuthenticatedAccount } from '../../auth/index.js';

@Controller({
  path: '/workspaces',
})
export class WorkspacesController {
  constructor(
    @Inject(WorkspaceApi)
    private readonly workspace: WorkspaceApi,
  ) {}

  @Get()
  public find(
    @CurrentAccount() account: AuthenticatedAccount,
  ): Promise<WorkspaceDto[]> {
    return this.workspace.workspaces.find(account.id);
  }

  @Post()
  public create(
    @CurrentAccount() account: AuthenticatedAccount,
    @Body({ schema: CreateWorkspaceDtoSchema }) data: CreateWorkspaceDto,
  ): Promise<WorkspaceDto> {
    return this.workspace.workspaces.create(account.id, data);
  }
}
