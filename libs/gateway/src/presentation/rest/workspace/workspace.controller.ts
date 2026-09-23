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
    private readonly workspaceApi: WorkspaceApi,
  ) {}

  @Get()
  public find(): Promise<WorkspaceDto[]> {
    return this.workspaceApi.find();
  }

  @Post()
  public create(
    @Body({ schema: CreateWorkspaceDtoSchema }) data: CreateWorkspaceDto,
  ): Promise<WorkspaceDto> {
    return this.workspaceApi.create(data);
  }
}
