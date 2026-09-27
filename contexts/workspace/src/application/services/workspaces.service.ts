import { Inject, Injectable } from '@nestjs/common';

import type {
  CreateWorkspaceDto,
  FindWorkspacesDto,
  WorkspaceDto,
  WorkspacesApi,
} from '@intentra/contracts/workspace';
import { WorkspaceId } from '@intentra/shared';

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

  public async find(query: FindWorkspacesDto = {}): Promise<WorkspaceDto[]> {
    const workspaces = await this.workspaceRepository.find(
      query.ids?.map(id => new WorkspaceId(id)),
    );
    return workspaces.map(toWorkspaceDto);
  }
}
