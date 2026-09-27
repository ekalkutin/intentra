import { Injectable } from '@nestjs/common';

import { TOOL_CATALOG } from '@intentra/agent-surface';

import { ToolCatalog } from '../../application/ports/tool-catalog.port.js';
import type { ToolId } from '../../domain/value-objects/tool-id.vo.js';

/** Backed by the shared catalog: only the tools exposed to agents count. */
@Injectable()
export class ToolCatalogAdapter extends ToolCatalog {
  readonly #available = new Set(
    TOOL_CATALOG.filter(tool => tool.exposure.agents).map(tool => tool.id),
  );

  public isAvailable(tool: ToolId): boolean {
    return this.#available.has(tool.value);
  }
}
