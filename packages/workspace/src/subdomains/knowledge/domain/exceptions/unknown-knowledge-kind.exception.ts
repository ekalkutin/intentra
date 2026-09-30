import { DomainException } from '@intentra/shared-kernel';

export class UnknownKnowledgeKindException extends DomainException<'UNKNOWN_KNOWLEDGE_KIND'> {
  constructor() {
    super('Unknown kind of knowledge', 'UNKNOWN_KNOWLEDGE_KIND');
  }
}
