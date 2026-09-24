import { Inject, Injectable } from '@nestjs/common';

import type {
  CreateWorkspaceDto,
  WorkspaceDto,
  WorkspacesApi,
} from '@intentra/workspace-contracts';

import { Workspace } from '../../domain/entities/index.js';
import { WorkspaceRepository } from '../ports/index.js';

@Injectable()
export class WorkspacesService implements WorkspacesApi {
  constructor(
    @Inject(WorkspaceRepository)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

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
