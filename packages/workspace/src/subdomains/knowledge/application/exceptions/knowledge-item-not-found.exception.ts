import { NotFoundException } from '@intentra/shared-kernel';

export class KnowledgeItemNotFoundException extends NotFoundException<'KNOWLEDGE_ITEM_NOT_FOUND'> {
  constructor() {
    super('Knowledge item not found', 'KNOWLEDGE_ITEM_NOT_FOUND');
  }
}
