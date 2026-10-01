import { DomainException } from '@intentra/shared-kernel';

export class InvalidModelProfileException extends DomainException<'INVALID_MODEL_PROFILE'> {
  /** `reason` names the field and what it must be. */
  constructor(reason: string) {
    super(reason, 'INVALID_MODEL_PROFILE');
  }
}
