import { DomainException } from '@intentra/shared-kernel';

export class InvalidKnowledgeTitleException extends DomainException<'INVALID_KNOWLEDGE_TITLE'> {
  constructor() {
    super(
      'Knowledge title must be 1 to 200 characters long',
      'INVALID_KNOWLEDGE_TITLE',
    );
  }
}
