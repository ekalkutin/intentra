import { Inject, Injectable } from '@nestjs/common';

import { WorkspaceApi } from '@intentra/workspace-contracts';

import { WorkspacesService } from './workspaces.service.js';

/** Local binding of `WorkspaceApi`: groups the services under one token. */
@Injectable()
export class WorkspaceApiService extends WorkspaceApi {
  constructor(
    @Inject(WorkspacesService)
    public readonly workspaces: WorkspacesService,
  ) {
    super();
  }
}
