import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  CreateWorkspaceDtoSchema,
  WorkspaceApi,
  type CreateWorkspaceDto,
  type WorkspaceDto,
} from '@intentra/contracts/workspace';

import { SchemaPipe } from '../schema.pipe.js';

import { CreateWorkspaceInput, WorkspaceType } from './dto/index.js';

@Resolver()
export class WorkspacesResolver {
  constructor(
    @Inject(WorkspaceApi)
    private readonly workspace: WorkspaceApi,
  ) {}

  @Query(() => [WorkspaceType], { name: 'workspaces' })
  public workspaces(): Promise<WorkspaceDto[]> {
    return this.workspace.workspaces.find();
  }

  @Mutation(() => WorkspaceType, { name: 'createWorkspace' })
  public createWorkspace(
    @Args(
      'input',
      { type: () => CreateWorkspaceInput },
      new SchemaPipe(CreateWorkspaceDtoSchema),
    )
    input: CreateWorkspaceDto,
  ): Promise<WorkspaceDto> {
    return this.workspace.workspaces.create(input);
  }
}
