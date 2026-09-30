import { DomainException } from '@intentra/shared-kernel';

export class InvalidKnowledgeKeyException extends DomainException<'INVALID_KNOWLEDGE_KEY'> {
  constructor() {
    super(
      'Knowledge key must be a kind prefix and a number, such as REQ-12',
      'INVALID_KNOWLEDGE_KEY',
    );
  }
}
