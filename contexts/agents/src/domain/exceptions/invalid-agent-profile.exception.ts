import { DomainException } from '@intentra/shared';

/** A value of an agent profile breaks its rules: name, instructions, model, tool. */
export class InvalidAgentProfileException extends DomainException<'INVALID_AGENT_PROFILE'> {
  constructor(message: string) {
    super(message, 'INVALID_AGENT_PROFILE');
  }
}
