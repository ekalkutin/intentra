import { DomainException } from '@intentra/shared-kernel';

export class RationaleRequiredException extends DomainException<'RATIONALE_REQUIRED'> {
  constructor() {
    super(
      'Knowledge recorded by an agent must say what it rests on: give a rationale',
      'RATIONALE_REQUIRED',
    );
  }
}
