import type { ToolId } from '../../domain/value-objects/tool-id.vo.js';

export class UnknownToolError extends Error {
  constructor(public readonly tool: ToolId) {
    super(`Tool ${tool.value} is not available to agents`);
    this.name = UnknownToolError.name;
  }
}
