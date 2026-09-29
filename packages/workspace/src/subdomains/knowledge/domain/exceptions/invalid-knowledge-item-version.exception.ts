import { DomainException } from '@intentra/shared-kernel';

export class InvalidKnowledgeItemVersionException extends DomainException<'INVALID_KNOWLEDGE_ITEM_VERSION'> {
  constructor() {
    super(
      'Knowledge item version must be a whole number from 1',
      'INVALID_KNOWLEDGE_ITEM_VERSION',
    );
  }
}
