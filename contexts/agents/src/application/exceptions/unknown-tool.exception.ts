import { ApplicationException, HttpStatus } from '@intentra/shared';

import type { ToolId } from '../../domain/value-objects/index.js';

/** The request names a tool agents cannot use: the caller's mistake. */
export class UnknownToolException extends ApplicationException<'UNKNOWN_TOOL'> {
  protected static override readonly defaultStatus = HttpStatus.BAD_REQUEST;

  constructor(tool: ToolId) {
    super(`Tool ${tool.value} is not available to agents`, 'UNKNOWN_TOOL');
  }
}
