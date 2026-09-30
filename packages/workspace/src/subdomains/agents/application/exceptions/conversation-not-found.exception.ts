import { NotFoundException } from '@intentra/shared-kernel';

export class ConversationNotFoundException extends NotFoundException<'CONVERSATION_NOT_FOUND'> {
  constructor() {
    super('Conversation not found', 'CONVERSATION_NOT_FOUND');
  }
}
