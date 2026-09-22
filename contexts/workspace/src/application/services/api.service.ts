import { Injectable } from '@nestjs/common';

import { WorkspaceApiPort } from '../ports/index.js';

import { ProjectsService } from './projects.service.js';
import { WorkspacesService } from './workspaces.service.js';

@Injectable()
export class WorkspaceApiService implements WorkspaceApiPort {
  constructor(
    public readonly workspaces: WorkspacesService,
    public readonly projects: ProjectsService,
  ) {}
}
