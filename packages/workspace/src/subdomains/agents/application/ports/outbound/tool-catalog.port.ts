import type { ToolName } from '../../../domain/value-objects/index.js';

export type CatalogTool = {
  readonly name: ToolName;
  readonly description: string;
  /** False for a tool that writes. */
  readonly readOnly: boolean;
};

/** The tools the code offers Intentra's Agents: the contract between the code and the Agents as data. */
export abstract class ToolCatalog {
  abstract list(): readonly CatalogTool[];
}
