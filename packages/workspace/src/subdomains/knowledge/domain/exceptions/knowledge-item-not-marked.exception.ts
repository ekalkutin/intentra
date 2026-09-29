import { ConflictException } from '@intentra/shared-kernel';

export class KnowledgeItemNotMarkedException extends ConflictException<'KNOWLEDGE_ITEM_NOT_MARKED'> {
  constructor() {
    super(
      'Only an item marked as needing review can be confirmed',
      'KNOWLEDGE_ITEM_NOT_MARKED',
    );
  }
}
