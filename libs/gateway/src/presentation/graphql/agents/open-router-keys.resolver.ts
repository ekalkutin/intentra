import { Inject } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  AgentsApi,
  SetOpenRouterKeyDtoSchema,
  type OpenRouterKeyDto,
  type SetOpenRouterKeyDto,
} from '@intentra/contracts/agents';

import {
  CurrentAccount,
  WorkspaceMembership,
  type AuthenticatedAccount,
} from '../../auth/index.js';
import { SchemaPipe } from '../schema.pipe.js';

import { OpenRouterKeyType, SetOpenRouterKeyInput } from './dto/index.js';

@Resolver()
export class OpenRouterKeysResolver {
  constructor(
    @Inject(AgentsApi)
    private readonly agents: AgentsApi,

    @Inject(WorkspaceMembership)
    private readonly membership: WorkspaceMembership,
  ) {}

  @Query(() => OpenRouterKeyType, { name: 'openRouterKey', nullable: true })
  public async openRouterKey(
    @CurrentAccount() account: AuthenticatedAccount,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ): Promise<OpenRouterKeyDto | null> {
    await this.membership.assert(account.id, workspaceId);
    return this.agents.openRouterKeys.find(workspaceId);
  }

  @Mutation(() => OpenRouterKeyType, { name: 'setOpenRouterKey' })
  public async setOpenRouterKey(
    @CurrentAccount() account: AuthenticatedAccount,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args(
      'input',
      { type: () => SetOpenRouterKeyInput },
      new SchemaPipe(SetOpenRouterKeyDtoSchema),
    )
    input: SetOpenRouterKeyDto,
  ): Promise<OpenRouterKeyDto> {
    await this.membership.assert(account.id, workspaceId);
    return this.agents.openRouterKeys.set(workspaceId, input);
  }

  @Mutation(() => Boolean, { name: 'removeOpenRouterKey' })
  public async removeOpenRouterKey(
    @CurrentAccount() account: AuthenticatedAccount,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ): Promise<boolean> {
    await this.membership.assert(account.id, workspaceId);
    await this.agents.openRouterKeys.remove(workspaceId);
    return true;
  }
}
