import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import type { AgentProfileDto } from '@intentra/contracts/agents';
import type { WorkspaceDto } from '@intentra/contracts/workspace';

import { WorkspaceType } from '../workspace/dto/index.js';
import { WorkspaceLoader } from '../workspace/index.js';

import { AgentProfileType } from './dto/index.js';

@Resolver(() => AgentProfileType)
export class AgentProfileFieldResolver {
  constructor(private readonly workspaces: WorkspaceLoader) {}

  @ResolveField('workspace', () => WorkspaceType, { nullable: true })
  public workspace(
    @Parent() profile: AgentProfileDto,
  ): Promise<WorkspaceDto | null> {
    return this.workspaces.load(profile.workspaceId);
  }
}
