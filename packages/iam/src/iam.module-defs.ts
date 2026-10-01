import { ConfigurableModuleBuilder } from '@nestjs/common';

/** The Account made the only Platform Admin when the server starts. */
export type PlatformAdminCredentials = {
  readonly email: string;
  /** Used only to create the Account; an existing Account keeps its own name. */
  readonly name: string;
  /** Used only to create the Account; an existing Account keeps its own password. */
  readonly password: string;
};

export type IamModuleOptions = {
  readonly accessTokenSecret: string;
  readonly refreshTokenSecret: string;
  readonly accessTokenTtlSeconds: number;
  readonly refreshTokenTtlSeconds: number;
  /** Null or left out: nobody is a Platform Admin; whoever was is dismissed on start. */
  readonly platformAdmin?: PlatformAdminCredentials | null;
};

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN: IAM_OPTIONS } =
  new ConfigurableModuleBuilder<IamModuleOptions>().build();
