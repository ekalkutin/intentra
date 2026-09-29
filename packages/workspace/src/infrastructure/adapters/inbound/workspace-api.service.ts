import { Inject, Injectable } from '@nestjs/common';

import type { WorkspaceApi } from '@intentra/contracts/workspace';

import {
  InvitationsService,
  MembersService,
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
    @Inject(InvitationsService)
    public readonly invitations: InvitationsService,
    @Inject(MembersService)
    public readonly members: MembersService,
  ) {}
}
