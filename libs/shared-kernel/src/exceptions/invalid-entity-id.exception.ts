import { DomainException } from './domain.exception.js';

export class InvalidEntityIdException extends DomainException<'INVALID_ENTITY_ID'> {
  constructor() {
    super('Entity id must be a UUID', 'INVALID_ENTITY_ID');
  }
}
