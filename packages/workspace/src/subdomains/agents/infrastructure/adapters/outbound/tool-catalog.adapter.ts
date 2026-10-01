import { Injectable, Provider } from '@nestjs/common';

import { AGENT_TOOLS, isReadOnlyTool } from '@intentra/agent-toolkit';

import {
  ToolCatalog,
  type CatalogTool,
} from '../../../application/ports/outbound/index.js';
import { ToolName } from '../../../domain/value-objects/index.js';

/** The tools of `@intentra/agent-toolkit` that an Agent may be given. */
@Injectable()
export class ToolCatalogAdapter extends ToolCatalog {
  readonly #tools: readonly CatalogTool[] = Object.values(AGENT_TOOLS).map(
    tool => ({
      name: new ToolName(tool.id),
      description: tool.description,
      readOnly: isReadOnlyTool(tool),
    }),
  );

  public list(): readonly CatalogTool[] {
    return this.#tools;
  }
}

export const TOOL_CATALOG_PROVIDER: Provider = {
  provide: ToolCatalog,
  useClass: ToolCatalogAdapter,
};
