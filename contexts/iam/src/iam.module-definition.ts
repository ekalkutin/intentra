import { ConfigurableModuleBuilder } from '@nestjs/common';

export type IamModuleOptions = {
  readonly database: {
    /** Postgres URL of IAM's own database. */
    readonly url: string;
  };
};

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN: IAM_OPTIONS } =
  new ConfigurableModuleBuilder<IamModuleOptions>().build();
