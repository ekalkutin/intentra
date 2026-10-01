import { Inject, Injectable } from '@nestjs/common';

import type { WorkspaceApi } from '@intentra/contracts/workspace';

import {
  ConversationsService,
  ProviderKeyService,
} from './subdomains/agents/index.js';
import { KnowledgeService } from './subdomains/knowledge/index.js';
import {
  AccessService,
  InvitationsService,
  MembersService,
  PersonalAccessTokensService,
  ProjectRolesService,
  ProjectsService,
  WorkspacesService,
} from './subdomains/tenancy/index.js';

/** The Workspace context's published API: one sub-API per use-case group of every subdomain. */
@Injectable()
export class WorkspaceApiService implements WorkspaceApi {
  constructor(
    @Inject(WorkspacesService)
    public readonly workspaces: WorkspacesService,
    @Inject(ProjectsService)
    public readonly projects: ProjectsService,
    @Inject(ProjectRolesService)
    public readonly projectRoles: ProjectRolesService,
    @Inject(InvitationsService)
    public readonly invitations: InvitationsService,
    @Inject(MembersService)
    public readonly members: MembersService,
    @Inject(PersonalAccessTokensService)
    public readonly personalAccessTokens: PersonalAccessTokensService,
    @Inject(AccessService)
    public readonly access: AccessService,
    @Inject(KnowledgeService)
    public readonly knowledge: KnowledgeService,
    @Inject(ConversationsService)
    public readonly conversations: ConversationsService,
    @Inject(ProviderKeyService)
    public readonly providerKey: ProviderKeyService,
  ) {}
}
