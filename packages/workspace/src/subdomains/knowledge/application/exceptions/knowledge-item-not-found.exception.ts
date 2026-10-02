import { NotFoundException } from '@intentra/shared-kernel';

export class KnowledgeItemNotFoundException extends NotFoundException<'KNOWLEDGE_ITEM_NOT_FOUND'> {
  /** Names the Knowledge Key when the caller asked for several. */
  constructor(key?: string) {
    super(
      key ? `Knowledge item not found: ${key}` : 'Knowledge item not found',
      'KNOWLEDGE_ITEM_NOT_FOUND',
    );
  }
}
