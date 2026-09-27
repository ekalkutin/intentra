import { DomainException } from '@intentra/shared';

export class InvalidDisplayNameException extends DomainException<'INVALID_DISPLAY_NAME'> {
  constructor(maxLength: number) {
    super(
      `Display name must be 1 to ${maxLength} characters long`,
      'INVALID_DISPLAY_NAME',
    );
  }
}
