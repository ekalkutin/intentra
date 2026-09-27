import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import type { ProjectDto, WorkspaceDto } from '@intentra/contracts/workspace';

import { ProjectType, WorkspaceType } from './dto/index.js';
import { WorkspaceLoader } from './workspace.loader.js';

@Resolver(() => ProjectType)
export class ProjectFieldResolver {
  constructor(private readonly workspaces: WorkspaceLoader) {}

  @ResolveField('workspace', () => WorkspaceType, { nullable: true })
  public workspace(
    @Parent() project: ProjectDto,
  ): Promise<WorkspaceDto | null> {
    return this.workspaces.load(project.workspaceId);
  }
}
