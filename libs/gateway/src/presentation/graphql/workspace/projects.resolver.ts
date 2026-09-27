import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  CreateProjectDtoSchema,
  WorkspaceApi,
  type CreateProjectDto,
  type ProjectDto,
} from '@intentra/contracts/workspace';

import { SchemaPipe } from '../schema.pipe.js';

import { CreateProjectInput, ProjectType } from './dto/index.js';

@Resolver()
export class ProjectsResolver {
  constructor(
    @Inject(WorkspaceApi)
    private readonly workspace: WorkspaceApi,
  ) {}

  @Query(() => [ProjectType], { name: 'projects' })
  public projects(): Promise<ProjectDto[]> {
    return this.workspace.projects.find();
  }

  @Mutation(() => ProjectType, { name: 'createProject' })
  public createProject(
    @Args(
      'input',
      { type: () => CreateProjectInput },
      new SchemaPipe(CreateProjectDtoSchema),
    )
    input: CreateProjectDto,
  ): Promise<ProjectDto> {
    return this.workspace.projects.create(input);
  }
}
