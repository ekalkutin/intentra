import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { IamApi, type AccountDto, type Actor } from '@intentra/contracts/iam';
import { WorkspaceApi } from '@intentra/contracts/workspace';

import { CurrentActor, PlatformAdminGuard } from '../auth/index.js';

/** Accounts across the platform. */
@Controller('platform/accounts')
@UseGuards(PlatformAdminGuard)
export class PlatformAccountsController {
  constructor(
    @Inject(IamApi) private readonly iam: IamApi,
    @Inject(WorkspaceApi) private readonly workspace: WorkspaceApi,
  ) {}

  @Get()
  public async list(@CurrentActor() actor: Actor): Promise<AccountDto[]> {
    return this.iam.accounts.list(actor);
  }

  /**
   * IAM blocks the Account, then Workspace revokes its Members' Personal
   * Access Tokens: two transactions, with no events between the contexts yet.
   * Both are idempotent, so blocking again finishes what a failure left.
   */
  @Post(':accountId/block')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async block(
    @CurrentActor() actor: Actor,
    @Param('accountId') accountId: string,
  ): Promise<void> {
    await this.iam.accounts.block(actor, accountId);
    await this.workspace.platformWorkspaces.revokeAccountTokens(
      actor,
      accountId,
    );
  }

  @Post(':accountId/unblock')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async unblock(
    @CurrentActor() actor: Actor,
    @Param('accountId') accountId: string,
  ): Promise<void> {
    return this.iam.accounts.unblock(actor, accountId);
  }
}
