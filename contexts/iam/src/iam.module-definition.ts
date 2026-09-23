import { ConfigurableModuleBuilder } from '@nestjs/common';

// Options of the IAM context. Empty for now; add fields as the context needs them.
export type IamModuleOptions = {};

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN: IAM_OPTIONS } =
  new ConfigurableModuleBuilder<IamModuleOptions>().build();
