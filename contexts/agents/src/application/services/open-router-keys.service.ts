import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import type {
  OpenRouterKeyDto,
  OpenRouterKeysApi,
  SetOpenRouterKeyDto,
} from '@intentra/contracts/agents';

import {
  FindOneOpenRouterKeyQuery,
  RemoveOpenRouterKeyCommand,
  SetOpenRouterKeyCommand,
} from '../use-cases/open-router-keys/index.js';

@Injectable()
export class OpenRouterKeysService implements OpenRouterKeysApi {
  constructor(
    @Inject(CommandBus)
    private readonly commandBus: CommandBus,

    @Inject(QueryBus)
    private readonly queryBus: QueryBus,
  ) {}

  public find(workspaceId: string): Promise<OpenRouterKeyDto | null> {
    return this.queryBus.execute(new FindOneOpenRouterKeyQuery(workspaceId));
  }

  public async set(
    workspaceId: string,
    data: SetOpenRouterKeyDto,
  ): Promise<OpenRouterKeyDto> {
    await this.commandBus.execute(
      new SetOpenRouterKeyCommand(workspaceId, data),
    );
    return (await this.find(workspaceId))!;
  }

  public remove(workspaceId: string): Promise<void> {
    return this.commandBus.execute(new RemoveOpenRouterKeyCommand(workspaceId));
  }
}
