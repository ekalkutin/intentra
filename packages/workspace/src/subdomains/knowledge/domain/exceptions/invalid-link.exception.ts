import { DomainException } from '@intentra/shared-kernel';

export class InvalidLinkException extends DomainException<'INVALID_LINK'> {
  constructor() {
    super(
      'A link must be of a known type, lead to another item, once, and to the right kind: uses-term to a Term, justified-by to a Decision, answers to an Open Question; only an Open Question concerns another item',
      'INVALID_LINK',
    );
  }
}
