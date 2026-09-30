import { ConflictException } from '@intentra/shared-kernel';

export class KnowledgeItemNeedsReviewException extends ConflictException<'KNOWLEDGE_ITEM_NEEDS_REVIEW'> {
  constructor() {
    super(
      'Something this draft rests on has changed: confirm it still holds or edit it before approving',
      'KNOWLEDGE_ITEM_NEEDS_REVIEW',
    );
  }
}
