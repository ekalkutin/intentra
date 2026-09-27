import { NotFoundException } from '@intentra/shared';

/** Also thrown for an archived profile: for the API it is gone. */
export class AgentProfileNotFoundException extends NotFoundException<'AGENT_PROFILE_NOT_FOUND'> {
  constructor(agentProfileId: string) {
    super(
      `Agent profile ${agentProfileId} not found`,
      'AGENT_PROFILE_NOT_FOUND',
    );
  }
}
