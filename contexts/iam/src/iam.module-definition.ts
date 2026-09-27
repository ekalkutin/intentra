import { ConfigurableModuleBuilder } from '@nestjs/common';

export type IamModuleOptions = {
  /** Signs access tokens. Must differ from the refresh one. */
  readonly accessTokenSecret: string;
  /** Signs refresh tokens, so one cannot be passed off as the other. */
  readonly refreshTokenSecret: string;
};

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN: IAM_OPTIONS } =
  new ConfigurableModuleBuilder<IamModuleOptions>().build();
