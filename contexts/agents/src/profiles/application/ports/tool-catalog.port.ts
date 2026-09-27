import type { ToolId } from '../../domain/value-objects/tool-id.vo.js';

/** The tools Intentra's own agents may be given. */
export abstract class ToolCatalog {
  abstract isAvailable(tool: ToolId): boolean;
}
