import { ToolId } from '../../domain/value-objects/index.js';
import { UnknownToolException } from '../exceptions/index.js';

export type CatalogTool = {
  readonly id: string;
  readonly description: string;
};

/** The tools Intentra's own agents may be given. */
export abstract class ToolCatalog {
  abstract find(): readonly CatalogTool[];

  public isAvailable(tool: ToolId): boolean {
    return this.find().some(available => available.id === tool.value);
  }

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
