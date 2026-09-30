import { DomainException } from '@intentra/shared-kernel';

export class InvalidConversationTitleException extends DomainException<'INVALID_CONVERSATION_TITLE'> {
  constructor() {
    super(
      'Conversation title must be 1 to 200 characters long',
      'INVALID_CONVERSATION_TITLE',
    );
  }
}
