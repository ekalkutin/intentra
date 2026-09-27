import { DomainException } from '@intentra/shared';

export class InvalidAgentProfileException extends DomainException<'INVALID_AGENT_PROFILE'> {
  constructor(message: string) {
    super(message, 'INVALID_AGENT_PROFILE');
  }
}
