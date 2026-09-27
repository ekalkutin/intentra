import { DynamicModule, Module, type ModuleMetadata } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthGuard } from './auth.guard.js';
import { WorkspaceMembership } from './workspace-membership.js';

type AuthModuleOptions = {
  /** Provide IamApi (tokens) and WorkspaceApi (members). */
  readonly contexts: NonNullable<ModuleMetadata['imports']>;
};

/**
 * The gateway's one door: it checks who calls (the global guard) and what they
 * may reach (`WorkspaceMembership`). Contexts trust the account id they get.
 * Register it once and import that same object everywhere, or the guard runs
 * twice.
 */
@Module({})
export class AuthModule {
  static register({ contexts }: AuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: contexts,
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        WorkspaceMembership,
      ],
      exports: [WorkspaceMembership],
    };
  }
}
