import {
  DynamicModule,
  Global,
  Module,
  ModuleMetadata,
  Provider,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { HttpModule } from './http.module.js';
import {
  AuthenticatedGuard,
  WorkspaceGuard,
} from './infrastructure/common/guards/index.js';

type ApiGatewayModuleOptions = {
  imports?: ModuleMetadata['imports'];
  providers: Provider[];
};

/**
 * Обёртка, через которую связки портов из композиционного корня становятся
 * видны всему приложению — в том числе охранникам, живущим в этом пакете.
 */
@Global()
@Module({})
class GatewayPortsModule {
  public static forRoot(options: ApiGatewayModuleOptions): DynamicModule {
    return {
      module: GatewayPortsModule,
      imports: options.imports ?? [],
      providers: options.providers,
      exports: options.providers,
    };
  }
}

/**
 * Охранники объявлены здесь, а не в транспортном модуле, чтобы их область
 * действия была видна: аутентифицировано всё, что не помечено `@Public()`.
 *
 * Порядок важен — `APP_GUARD` выполняются в порядке объявления:
 * `AuthenticatedGuard` кладёт в запрос, кто спрашивает, `WorkspaceGuard`
 * добавляет, в каком workspace. Права — дело Workspace (ADR 0003).
 */
@Module({
  imports: [HttpModule],
  providers: [
    { provide: APP_GUARD, useClass: AuthenticatedGuard },
    { provide: APP_GUARD, useClass: WorkspaceGuard },
  ],
})
export class ApiGatewayModule {
  public static forRoot(options: ApiGatewayModuleOptions): DynamicModule {
    return {
      module: ApiGatewayModule,
      imports: [GatewayPortsModule.forRoot(options)],
    };
  }
}
