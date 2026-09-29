import { ConflictException } from '@intentra/shared-kernel';

export class KnowledgeItemNotDraftException extends ConflictException<'KNOWLEDGE_ITEM_NOT_DRAFT'> {
  constructor() {
    super(
      'Only a draft can change: an approved knowledge item is superseded or retired instead, a rejected one is recorded again',
      'KNOWLEDGE_ITEM_NOT_DRAFT',
    );
  }
}
