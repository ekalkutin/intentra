import { DomainException } from '@intentra/shared-kernel';

export class InvalidSkillException extends DomainException<'INVALID_SKILL'> {
  /** `reason` names the field and what it must be. */
  constructor(reason: string) {
    super(reason, 'INVALID_SKILL');
  }
}
