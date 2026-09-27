import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import type {
  CreateWorkspaceDto,
  FindWorkspacesDto,
  UpdateWorkspaceDto,
  WorkspaceDto,
  WorkspacesApi,
} from '@intentra/contracts/workspace';

import {
  CreateWorkspaceCommand,
  FindManyWorkspacesQuery,
  GetOneWorkspaceQuery,
  UpdateWorkspaceCommand,
} from '../use-cases/workspaces/index.js';

@Injectable()
export class WorkspacesService implements WorkspacesApi {
  constructor(
    @Inject(CommandBus)
    private readonly commandBus: CommandBus,

    @Inject(QueryBus)
    private readonly queryBus: QueryBus,
  ) {}

  public async create(
    accountId: string,
    data: CreateWorkspaceDto,
  ): Promise<WorkspaceDto> {
    const id = await this.commandBus.execute(
      new CreateWorkspaceCommand(accountId, data),
    );
    return this.getById(accountId, id);
  }

  public async update(
    accountId: string,
    id: string,
    data: UpdateWorkspaceDto,
  ): Promise<WorkspaceDto> {
    await this.commandBus.execute(
      new UpdateWorkspaceCommand(accountId, id, data),
    );
    return this.getById(accountId, id);
  }

  public find(
    accountId: string,
    filter?: FindWorkspacesDto,
  ): Promise<WorkspaceDto[]> {
    return this.queryBus.execute(
      new FindManyWorkspacesQuery(accountId, filter),
    );
  }

  public getById(accountId: string, id: string): Promise<WorkspaceDto> {
    return this.queryBus.execute(new GetOneWorkspaceQuery(accountId, id));
  }
}
