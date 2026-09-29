import { DomainException } from '@intentra/shared-kernel';

export class KnowledgeKindMismatchException extends DomainException<'KNOWLEDGE_KIND_MISMATCH'> {
  constructor() {
    super(
      'The kind of a knowledge item never changes: delete it and record it again',
      'KNOWLEDGE_KIND_MISMATCH',
    );
  }
}
