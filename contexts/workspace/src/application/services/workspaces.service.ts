import { Inject, Injectable } from '@nestjs/common';

import type {
  CreateWorkspaceDto,
  FindWorkspacesDto,
  WorkspaceDto,
  WorkspacesApi,
} from '@intentra/contracts/workspace';
import { AccountId, WorkspaceId } from '@intentra/shared';

import { Workspace } from '../../domain/entities/index.js';
import { WorkspaceNotFoundException } from '../exceptions/index.js';
import { toWorkspaceDto } from '../mappers/index.js';
import { WorkspaceRepository } from '../ports/index.js';

@Injectable()
export class WorkspacesService implements WorkspacesApi {
  constructor(
    @Inject(WorkspaceRepository)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  public async create(
    accountId: string,
    data: CreateWorkspaceDto,
  ): Promise<WorkspaceDto> {
    const workspace = Workspace.create({
      name: data.name,
      creator: new AccountId(accountId),
    });
    await this.workspaceRepository.save(workspace);
    return toWorkspaceDto(workspace);
  }

  public async find(
    accountId: string,
    query: FindWorkspacesDto = {},
  ): Promise<WorkspaceDto[]> {
    const workspaces = await this.workspaceRepository.findByMember(
      new AccountId(accountId),
      query.ids?.map(id => new WorkspaceId(id)),
    );
    return workspaces.map(toWorkspaceDto);
  }

  public async getById(accountId: string, id: string): Promise<WorkspaceDto> {
    const workspace = await this.workspaceRepository.getById(
      new WorkspaceId(id),
    );
    // Not a member: the workspace does not exist for this account.
    if (!workspace.hasMember(new AccountId(accountId))) {
      throw new WorkspaceNotFoundException(id);
    }
    return toWorkspaceDto(workspace);
  }
}
