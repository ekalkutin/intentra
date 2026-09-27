import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import {
  CreateWorkspaceDtoSchema,
  UpdateWorkspaceDtoSchema,
  WorkspaceApi,
  WorkspaceDto,
  type CreateWorkspaceDto,
  type UpdateWorkspaceDto,
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

  @Patch(':id')
  public update(
    @CurrentAccount() account: AuthenticatedAccount,
    @Param('id') id: string,
    @Body({ schema: UpdateWorkspaceDtoSchema }) data: UpdateWorkspaceDto,
  ): Promise<WorkspaceDto> {
    return this.workspace.workspaces.update(account.id, id, data);
  }
}
