import { DomainException } from './domain.exception.js';

export class InvalidPersonNameException extends DomainException<'INVALID_PERSON_NAME'> {
  constructor() {
    super('Name must be 1 to 100 characters long', 'INVALID_PERSON_NAME');
  }
}
