import { ConflictException } from '@intentra/shared-kernel';

export class ConversationBusyException extends ConflictException<'CONVERSATION_BUSY'> {
  constructor() {
    super(
      'Intentra is still answering in this Conversation',
      'CONVERSATION_BUSY',
    );
  }
}
