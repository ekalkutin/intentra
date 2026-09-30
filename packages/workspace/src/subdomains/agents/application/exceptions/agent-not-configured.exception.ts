import { UnavailableException } from '@intentra/shared-kernel';

export class AgentNotConfiguredException extends UnavailableException<'AGENT_NOT_CONFIGURED'> {
  constructor() {
    super('Agents are not configured on this server', 'AGENT_NOT_CONFIGURED');
  }
}
