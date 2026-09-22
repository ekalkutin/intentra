import { Body, Controller, Get, Post } from '@nestjs/common';

import {
  CreateWorkspaceSchema,
  type AccountIdentity,
  type CreateWorkspaceDto,
  type WorkspaceDto,
} from '@intentra/workspace-contracts';

import { WorkspaceClientPort } from '../../../application/ports/index.js';
import {
  AccountScoped,
  RequestAccount,
} from '../../../infrastructure/common/decorators/index.js';

/**
 * Действия, принадлежащие человеку, а не тенанту: свой список workspace и
 * создание нового. Адреса workspace в них нет, поэтому весь контроллер помечен
 * `@AccountScoped()` — иначе `WorkspaceGuard` требовал бы того, чего здесь
 * взяться не может.
 */
@Controller('workspaces')
@AccountScoped()
export class WorkspacesController {
  constructor(private readonly workspace: WorkspaceClientPort) {}

  @Get()
  public async findMine(
    @RequestAccount() identity: AccountIdentity,
  ): Promise<WorkspaceDto[]> {
    return this.workspace.workspaces.findMine(identity);
  }

  @Post()
  public async create(
    @Body({ schema: CreateWorkspaceSchema }) dto: CreateWorkspaceDto,
    @RequestAccount() identity: AccountIdentity,
  ): Promise<WorkspaceDto> {
    return this.workspace.workspaces.create(dto, identity);
  }
}
