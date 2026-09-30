import { HttpStatus } from '@nestjs/common';

import { GatewayException } from './gateway.exception.js';

/** No model to run Intentra's own Agents on: the server has no OpenRouter key. */
export class AgentNotConfiguredException extends GatewayException<'AGENT_NOT_CONFIGURED'> {
  constructor() {
    super(
      'Agents are not configured on this server',
      'AGENT_NOT_CONFIGURED',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
