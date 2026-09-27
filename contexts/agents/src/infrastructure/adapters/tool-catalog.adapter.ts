import { Injectable } from '@nestjs/common';

import { TOOL_CATALOG } from '@intentra/agent-surface';

import {
  ToolCatalog,
  type CatalogTool,
} from '../../application/ports/index.js';

/** Backed by the shared catalog: only the tools exposed to agents count. */
@Injectable()
export class ToolCatalogAdapter extends ToolCatalog {
  readonly #tools: readonly CatalogTool[] = TOOL_CATALOG.filter(
    tool => tool.exposure.agents,
  ).map(tool => ({ id: tool.id, description: tool.description }));

  public find(): readonly CatalogTool[] {
    return this.#tools;
  }
}
