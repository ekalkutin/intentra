import { ToolId } from '../../domain/value-objects/index.js';
import { UnknownToolException } from '../exceptions/index.js';

/** The tools Intentra's own agents may be given. */
export abstract class ToolCatalog {
  abstract isAvailable(tool: ToolId): boolean;

  public requireAvailable(ids: readonly string[]): ToolId[] {
    return ids.map(id => {
      const tool = new ToolId(id);
      if (!this.isAvailable(tool)) {
        throw new UnknownToolException(tool);
      }
      return tool;
    });
  }
}
