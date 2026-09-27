import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { IamApi } from '@intentra/contracts/iam';

import {
  AccountRepository,
  PasswordHasher,
  PersonalAccessTokenRepository,
  PersonalAccessTokenSecrets,
  TokenIssuer,
} from './application/ports/index.js';
import {
  AccountsService,
  AuthService,
  PersonalAccessTokensService,
} from './application/services/index.js';
import { CQRS_HANDLERS } from './application/use-cases/index.js';
import { IamApiService } from './iam-api.service.js';
import { ConfigurableModuleClass } from './iam.module-definition.js';
import {
  AccountRepositoryAdapter,
  PasswordHasherAdapter,
  PersonalAccessTokenRepositoryAdapter,
  PersonalAccessTokenSecretsAdapter,
  TokenIssuerAdapter,
} from './infrastructure/adapters/index.js';
import {
  AccountModel,
  AccountSchema,
  PersonalAccessTokenModel,
  PersonalAccessTokenSchema,
} from './infrastructure/database/index.js';

@Module({
  imports: [
    CqrsModule,
    // Secrets are passed per call: access and refresh tokens use different ones.
    JwtModule.register({}),
    MongooseModule.forFeature([
      {
        name: AccountModel.name,
        schema: AccountSchema,
      },
      {
        name: PersonalAccessTokenModel.name,
        schema: PersonalAccessTokenSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: IamApi,
      useClass: IamApiService,
    },
    ...CQRS_HANDLERS,
    AccountsService,
    AuthService,
    PersonalAccessTokensService,
    {
      provide: AccountRepository,
      useClass: AccountRepositoryAdapter,
    },
    {
      provide: PasswordHasher,
      useClass: PasswordHasherAdapter,
    },
    {
      provide: TokenIssuer,
      useClass: TokenIssuerAdapter,
    },
    {
      provide: PersonalAccessTokenRepository,
      useClass: PersonalAccessTokenRepositoryAdapter,
    },
    {
      provide: PersonalAccessTokenSecrets,
      useClass: PersonalAccessTokenSecretsAdapter,
    },
  ],
  exports: [IamApi],
})
export class IamModule extends ConfigurableModuleClass {}
