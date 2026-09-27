import { Inject, Injectable } from '@nestjs/common';

import { WorkspaceApi } from '@intentra/workspace-contracts';

import { ProjectsService } from '../../subdomains/projects/application/services/projects.service.js';

import { WorkspacesService } from './workspaces.service.js';

/** Local binding of `WorkspaceApi`: groups the services under one token. */
@Injectable()
export class WorkspaceApiService implements WorkspaceApi {
  constructor(
    @Inject(WorkspacesService)
    public readonly workspaces: WorkspacesService,
    @Inject(ProjectsService)
    public readonly projects: ProjectsService,
  ) {}
}
