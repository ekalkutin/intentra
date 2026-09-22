import {
  DynamicModule,
  Global,
  Module,
  ModuleMetadata,
  Provider,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import {
  AuthenticatedGuard,
  WorkspaceGuard,
} from './infrastructure/common/guards/index.js';
import { McpModule } from './mcp.module.js';
import { RestModule } from './rest.module.js';

type GatewayModuleOptions = {
  imports?: ModuleMetadata['imports'];
  providers: Provider[];
};

/**
 * Обёртка, через которую связки портов из композиционного корня становятся
 * видны всему приложению — в том числе охранникам и транспортам, живущим в
 * этом пакете.
 */
@Global()
@Module({})
class GatewayPortsModule {
  public static forRoot(options: GatewayModuleOptions): DynamicModule {
    return {
      module: GatewayPortsModule,
      imports: options.imports ?? [],
      providers: options.providers,
      exports: options.providers,
    };
  }
}

/**
 * Фасад продукта: одна дверь на каждый транспорт и ни одного собственного
 * правила.
 *
 * Транспорты — модули рядом друг с другом, а не пакеты: общее у них не домен,
 * а аутентификация, и держать её в публичном экспорте соседа значило бы
 * притворяться, что границы между ними больше, чем есть. Разделяет их линтер:
 * REST не заглядывает в MCP, MCP — в REST, общее лежит в `infrastructure/common`.
 *
 * Охранники объявлены здесь, а не в транспортных модулях, чтобы их область
 * действия была видна: аутентифицировано всё, что не помечено `@Public()`.
 *
 * Порядок важен — `APP_GUARD` выполняются в порядке объявления:
 * `AuthenticatedGuard` кладёт в запрос, кто спрашивает, `WorkspaceGuard`
 * добавляет, в каком workspace. Права — дело Workspace (ADR 0003).
 */
@Module({
  imports: [RestModule, McpModule],
  providers: [
    { provide: APP_GUARD, useClass: AuthenticatedGuard },
    { provide: APP_GUARD, useClass: WorkspaceGuard },
  ],
})
export class GatewayModule {
  public static forRoot(options: GatewayModuleOptions): DynamicModule {
    return {
      module: GatewayModule,
      imports: [GatewayPortsModule.forRoot(options)],
    };
  }
}
