import { DomainException } from '@intentra/shared-kernel';

export class UnknownKnowledgeStatusException extends DomainException<'UNKNOWN_KNOWLEDGE_STATUS'> {
  constructor() {
    super('Unknown knowledge status', 'UNKNOWN_KNOWLEDGE_STATUS');
  }
}
