import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ACCESS_PROVIDERS, APPLICATION_SERVICES } from './application/index.js';
import { WorkspaceApiPort } from './application/ports/index.js';
import { PERSISTENCE } from './infrastructure/persistence/index.js';
import { ACCESS_SUBDOMAIN_PROVIDERS } from './subdomains/access/index.js';
import { TENANCY_PROVIDERS } from './subdomains/tenancy/index.js';
import { WorkspaceConfigurableModule } from './workspace.module-defs.js';

/**
 * Один bounded context — один модуль Nest и одна база, собранный из субдоменов:
 * `tenancy` владеет workspace и проектами, `access` — участием и выданными
 * правами (ADR 0002).
 *
 * Провайдеры лежат одним плоским инжектором намеренно: субдомены — это папки с
 * границей в линтере, а не отдельно разворачиваемые единицы.
 */
@Module({
  imports: [CqrsModule],
  providers: [
    ...PERSISTENCE,
    ...ACCESS_PROVIDERS,
    ...APPLICATION_SERVICES,
    ...ACCESS_SUBDOMAIN_PROVIDERS,
    ...TENANCY_PROVIDERS,
  ],
  exports: [WorkspaceApiPort],
})
export class WorkspaceModule extends WorkspaceConfigurableModule {}
