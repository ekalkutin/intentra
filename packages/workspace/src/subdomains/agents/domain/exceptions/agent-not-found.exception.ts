import { NotFoundException } from '@intentra/shared-kernel';

export class AgentNotFoundException extends NotFoundException<'AGENT_NOT_FOUND'> {
  constructor() {
    super('Agent not found', 'AGENT_NOT_FOUND');
  }
}
