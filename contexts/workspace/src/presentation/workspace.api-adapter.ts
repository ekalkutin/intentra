import { Inject, Injectable } from '@nestjs/common';

import {
  CreateWorkspaceDto,
  WorkspaceApi,
  WorkspaceDto,
} from '@intentra/workspace-contracts';

import { WorkspaceRepository } from '../application/ports/index.js';
import { Workspace } from '../domain/entities/workspace.aggregate.js';

@Injectable()
export class WorkspaceApiAdapter extends WorkspaceApi {
  constructor(
    @Inject(WorkspaceRepository)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {
    super();
  }

  public async create(data: CreateWorkspaceDto): Promise<WorkspaceDto> {
    const workspace = Workspace.create(data);
    await this.workspaceRepository.save(workspace);
    return {
      id: workspace.id.value,
      name: workspace.name,
    };
  }

  public async find(): Promise<WorkspaceDto[]> {
    const workspaces = await this.workspaceRepository.find();
    return workspaces.map(workspace => ({
      id: workspace.id.value,
      name: workspace.name,
    }));
  }
}
