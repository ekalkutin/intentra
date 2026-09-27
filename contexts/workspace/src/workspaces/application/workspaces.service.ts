import { Inject, Injectable } from '@nestjs/common';

import type {
  CreateWorkspaceDto,
  WorkspaceDto,
  WorkspacesApi,
} from '@intentra/contracts/workspace';

import { Workspace } from '../domain/workspace.aggregate.js';

import { WorkspaceRepository } from './workspace-repository.port.js';
import { toWorkspaceDto } from './workspace.mapper.js';

@Injectable()
export class WorkspacesService implements WorkspacesApi {
  constructor(
    @Inject(WorkspaceRepository)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  public async create(data: CreateWorkspaceDto): Promise<WorkspaceDto> {
    const workspace = Workspace.create(data);
    await this.workspaceRepository.save(workspace);
    return toWorkspaceDto(workspace);
  }

  public async find(): Promise<WorkspaceDto[]> {
    const workspaces = await this.workspaceRepository.find();
    return workspaces.map(toWorkspaceDto);
  }
}
