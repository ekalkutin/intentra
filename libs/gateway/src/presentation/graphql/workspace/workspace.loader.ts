import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';

import { WorkspaceApi, type WorkspaceDto } from '@intentra/contracts/workspace';

import { accountOf, type AuthenticatedRequest } from '../../auth/index.js';
import { EntityLoader } from '../loaders/index.js';

/** Loads only workspaces the signed-in account is a member of. */
@Injectable({ scope: Scope.REQUEST })
export class WorkspaceLoader extends EntityLoader<WorkspaceDto> {
  constructor(
    @Inject(WorkspaceApi) workspace: WorkspaceApi,
    @Inject(CONTEXT) context: { req: AuthenticatedRequest },
  ) {
    super(async ids => {
      const account = accountOf(context.req);
      return account
        ? workspace.workspaces.find(account.id, { ids: [...ids] })
        : [];
    });
  }
}
