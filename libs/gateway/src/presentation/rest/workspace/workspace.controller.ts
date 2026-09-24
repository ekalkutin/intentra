import { Body, Controller, Get, Inject, Post } from '@nestjs/common';

import {
  CreateWorkspaceDtoSchema,
  WorkspaceApi,
  WorkspaceDto,
  type CreateWorkspaceDto,
} from '@intentra/workspace-contracts';

@Controller({
  path: '/workspaces',
})
export class WorkspaceController {
  constructor(
    @Inject(WorkspaceApi)
    private readonly workspace: WorkspaceApi,
  ) {}

  @Get()
  public find(): Promise<WorkspaceDto[]> {
    return this.workspace.workspaces.find();
  }

  @Post()
  public create(
    @Body({ schema: CreateWorkspaceDtoSchema }) data: CreateWorkspaceDto,
  ): Promise<WorkspaceDto> {
    return this.workspace.workspaces.create(data);
  }
}
