import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import type { AccountDto } from '@intentra/contracts/iam';
import type { WorkspaceDto } from '@intentra/contracts/workspace';

import { AccountType } from '../iam/dto/index.js';
import { AccountLoader } from '../iam/index.js';

import { WorkspaceType } from './dto/index.js';

@Resolver(() => WorkspaceType)
export class WorkspaceFieldResolver {
  constructor(private readonly accounts: AccountLoader) {}

  /** Safe to show: a workspace only reaches members, and they see each other. */
  @ResolveField('members', () => [AccountType])
  public members(@Parent() workspace: WorkspaceDto): Promise<AccountDto[]> {
    return this.accounts.loadMany(workspace.memberIds);
  }
}
