import { ConflictException } from '@intentra/shared-kernel';

export class KnowledgeItemNotApprovedException extends ConflictException<'KNOWLEDGE_ITEM_NOT_APPROVED'> {
  constructor() {
    super(
      'Only an approved knowledge item can be retired or replaced',
      'KNOWLEDGE_ITEM_NOT_APPROVED',
    );
  }
}
