import { DomainException } from '@intentra/shared-kernel';

export class InvalidPublishingNoteException extends DomainException<'INVALID_PUBLISHING_NOTE'> {
  constructor(maxLength: number) {
    super(
      `Publishing note must be 1 to ${maxLength} characters long`,
      'INVALID_PUBLISHING_NOTE',
    );
  }
}
