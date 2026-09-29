import { DomainException } from '@intentra/shared-kernel';

export class UnknownKnowledgeSourceException extends DomainException<'UNKNOWN_KNOWLEDGE_SOURCE'> {
  constructor() {
    super('Unknown knowledge source', 'UNKNOWN_KNOWLEDGE_SOURCE');
  }
}
