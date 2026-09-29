import { DomainException } from '@intentra/shared-kernel';

export class InvalidKnowledgeFieldsException extends DomainException<'INVALID_KNOWLEDGE_FIELDS'> {
  constructor() {
    super(
      'Knowledge fields must fit their kind: the main field is required, every text is 1 to 5000 characters long and every choice is one of the allowed values',
      'INVALID_KNOWLEDGE_FIELDS',
    );
  }
}
