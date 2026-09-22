import { ConfigurableModuleBuilder } from '@nestjs/common';

type IamDatabaseOptions = {
  readonly host: string;
  readonly port: number;
  readonly username: string;
  readonly password: string;
  readonly name: string;
};

type IamSecurityOptions = {
  readonly jwtSecret: string;
  /** Сроки жизни токенов в секундах. */
  readonly accessTokenTtl: number;
  readonly refreshTokenTtl: number;
};

export type IamModuleOptions = {
  readonly database: IamDatabaseOptions;
  readonly security: IamSecurityOptions;
};

export const {
  ConfigurableModuleClass: IamConfigurableModule,
  MODULE_OPTIONS_TOKEN: IAM_OPTIONS,
  OPTIONS_TYPE: IAM_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: IAM_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<IamModuleOptions>()
  .setClassMethodName('forRoot')
  .build();
