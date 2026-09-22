import { ConfigurableModuleBuilder } from '@nestjs/common';

type WorkspaceDatabaseOptions = {
  readonly host: string;
  readonly port: number;
  readonly username: string;
  readonly password: string;
  readonly name: string;
};

export type WorkspaceModuleOptions = {
  readonly database: WorkspaceDatabaseOptions;
};

export const {
  ConfigurableModuleClass: WorkspaceConfigurableModule,
  MODULE_OPTIONS_TOKEN: WORKSPACE_OPTIONS,
  OPTIONS_TYPE: WORKSPACE_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: WORKSPACE_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<WorkspaceModuleOptions>()
  .setClassMethodName('forRoot')
  .build();
