import { Inject, Injectable } from '@nestjs/common';

import type { WorkspaceApi } from '@intentra/contracts/workspace';

import {
  AccessService,
  InvitationsService,
  MembersService,
  PersonalAccessTokensService,
  ProjectRolesService,
  ProjectsService,
  WorkspacesService,
} from '../../../application/services/index.js';

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
  ) {}
}
