import { DomainException } from '@intentra/shared-kernel';

export class InvalidEmailException extends DomainException<'INVALID_EMAIL'> {
  constructor() {
    super('Email is not valid', 'INVALID_EMAIL');
  }
}
