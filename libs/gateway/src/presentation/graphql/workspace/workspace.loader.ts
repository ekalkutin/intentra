import { Inject, Injectable, Scope } from '@nestjs/common';

import { WorkspaceApi, type WorkspaceDto } from '@intentra/contracts/workspace';

import { EntityLoader } from '../loaders/index.js';

@Injectable({ scope: Scope.REQUEST })
export class WorkspaceLoader extends EntityLoader<WorkspaceDto> {
  constructor(@Inject(WorkspaceApi) workspace: WorkspaceApi) {
    super(ids => workspace.workspaces.find({ ids: [...ids] }));
  }
}
