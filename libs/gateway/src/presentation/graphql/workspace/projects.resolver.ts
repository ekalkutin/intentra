import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  CreateProjectDtoSchema,
  WorkspaceApi,
  type CreateProjectDto,
  type ProjectDto,
} from '@intentra/contracts/workspace';

import { CurrentAccount, type AuthenticatedAccount } from '../../auth/index.js';
import { SchemaPipe } from '../schema.pipe.js';

import { CreateProjectInput, ProjectType } from './dto/index.js';

@Resolver()
export class ProjectsResolver {
  constructor(
    @Inject(WorkspaceApi)
    private readonly workspace: WorkspaceApi,
  ) {}

  @Query(() => [ProjectType], { name: 'projects' })
  public projects(
    @CurrentAccount() account: AuthenticatedAccount,
  ): Promise<ProjectDto[]> {
    return this.workspace.projects.find(account.id);
  }

  @Mutation(() => ProjectType, { name: 'createProject' })
  public createProject(
    @CurrentAccount() account: AuthenticatedAccount,
    @Args(
      'input',
      { type: () => CreateProjectInput },
      new SchemaPipe(CreateProjectDtoSchema),
    )
    input: CreateProjectDto,
  ): Promise<ProjectDto> {
    return this.workspace.projects.create(account.id, input);
  }
}
