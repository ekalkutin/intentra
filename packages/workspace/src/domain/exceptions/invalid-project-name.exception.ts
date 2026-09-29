import { DomainException } from '@intentra/shared-kernel';

export class InvalidProjectNameException extends DomainException<'INVALID_PROJECT_NAME'> {
  constructor() {
    super(
      'Project name must be 1 to 100 characters long',
      'INVALID_PROJECT_NAME',
    );
  }
}
