import {
  DynamicModule,
  Module,
  type ModuleMetadata,
  type Provider,
} from '@nestjs/common';

import { ActorGuard } from '../rest/auth/index.js';

import { AuthorizationCodes } from './authorization-codes.js';
import { OAuthDiscoveryController } from './oauth-discovery.controller.js';
import { OAuthController } from './oauth.controller.js';

type Registration = {
  readonly contexts: NonNullable<ModuleMetadata['imports']>;
  readonly imports: NonNullable<ModuleMetadata['imports']>;
  /** Must include `OAUTH_OPTIONS`. */
  readonly providers: readonly Provider[];
};

/** `/api/oauth/...`: registration, consent and the token endpoint. */
@Module({})
export class OAuthModule {
  static register({
    contexts,
    imports,
    providers,
  }: Registration): DynamicModule {
    return {
      module: OAuthModule,
      imports: [...contexts, ...imports],
      controllers: [OAuthController],
      providers: [AuthorizationCodes, ActorGuard, ...providers],
    };
  }
}

/** `/.well-known/...`, at the root rather than under `/api`. */
@Module({})
export class OAuthDiscoveryModule {
  static register({
    imports,
    providers,
  }: Omit<Registration, 'contexts'>): DynamicModule {
    return {
      module: OAuthDiscoveryModule,
      imports: [...imports],
      controllers: [OAuthDiscoveryController],
      providers: [...providers],
    };
  }
}
