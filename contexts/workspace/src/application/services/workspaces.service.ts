import { Inject, Injectable } from '@nestjs/common';

import type {
  CreateWorkspaceDto,
  WorkspaceDto,
  WorkspacesApi,
} from '@intentra/contracts/workspace';

import { Workspace } from '../../domain/entities/workspace.aggregate.js';
import { toWorkspaceDto } from '../mappers/workspace.mapper.js';
import { WorkspaceRepository } from '../ports/workspace-repository.port.js';

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
