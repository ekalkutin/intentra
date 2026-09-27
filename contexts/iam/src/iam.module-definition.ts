import { ConfigurableModuleBuilder } from '@nestjs/common';

export type IamModuleOptions = {
  readonly database: {
    /** Postgres URL of IAM's own database. */
    readonly url: string;
  };
};

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN: IAM_OPTIONS } =
  new ConfigurableModuleBuilder<IamModuleOptions>()
    // Global so the context's feature modules (accounts, ...) can inject
    // IamDatabase. Nothing outside IAM can name that token: it is not exported.
    .setExtras({}, definition => ({ ...definition, global: true }))
    .build();
