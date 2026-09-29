import { ConflictException } from '@intentra/shared-kernel';

export class KnowledgeItemLinkedException extends ConflictException<'KNOWLEDGE_ITEM_LINKED'> {
  constructor(keys: readonly string[]) {
    super(
      `Other items link to it, so it cannot be deleted: change their links first, or reject it: ${keys.join(', ')}`,
      'KNOWLEDGE_ITEM_LINKED',
    );
  }
}
