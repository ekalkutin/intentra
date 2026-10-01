import { DomainException } from '@intentra/shared-kernel';

export class InvalidAgentException extends DomainException<'INVALID_AGENT'> {
  /** `reason` names the field and what it must be. */
  constructor(reason: string) {
    super(reason, 'INVALID_AGENT');
  }
}
