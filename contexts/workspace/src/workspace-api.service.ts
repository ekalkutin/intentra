import { Inject, Injectable } from '@nestjs/common';

import type { WorkspaceApi } from '@intentra/contracts/workspace';

import { ProjectsService } from './projects/index.js';
import { WorkspacesService } from './workspaces/index.js';

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
