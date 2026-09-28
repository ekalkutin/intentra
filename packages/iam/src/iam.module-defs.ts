import { ConfigurableModuleBuilder } from '@nestjs/common';

export type IamModuleOptions = {
  readonly accessTokenSecret: string;
  readonly refreshTokenSecret: string;
};

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN: IAM_OPTIONS } =
  new ConfigurableModuleBuilder<IamModuleOptions>().build();
