import { ConflictException } from '@intentra/shared-kernel';

export class KnowledgeItemChangedException extends ConflictException<'KNOWLEDGE_ITEM_CHANGED'> {
  constructor() {
    super(
      'The knowledge item has changed since you last saw it: read it again',
      'KNOWLEDGE_ITEM_CHANGED',
    );
  }
}
