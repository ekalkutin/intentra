import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import {
  AccountIdentity,
  CreateWorkspaceDto,
  WorkspaceDto,
  WorkspacesApi,
} from '@intentra/workspace-contracts';

import {
  CreateWorkspaceCommand,
  FindMyWorkspacesQuery,
} from '../../subdomains/tenancy/application/use-cases/index.js';

@Injectable()
export class WorkspacesService implements WorkspacesApi {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  public async create(
    dto: CreateWorkspaceDto,
    identity: AccountIdentity,
  ): Promise<WorkspaceDto> {
    return this.commandBus.execute(new CreateWorkspaceCommand(dto, identity));
  }

  public async findMine(identity: AccountIdentity): Promise<WorkspaceDto[]> {
    return this.queryBus.execute(new FindMyWorkspacesQuery(identity));
  }
}
