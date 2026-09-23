import { ConfigurableModuleBuilder } from '@nestjs/common';

type DatabaseConfig = {
  readonly host: string;
  readonly name: string;
  readonly username: string;
  readonly password: string;
};

export type IamModuleOptions = {
  readonly database: DatabaseConfig;
};

export const { ConfigurableModuleClass, OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<IamModuleOptions>().build();
