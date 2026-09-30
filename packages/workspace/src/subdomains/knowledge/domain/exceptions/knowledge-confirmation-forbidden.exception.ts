import { ForbiddenException } from '@intentra/shared-kernel';

export class KnowledgeConfirmationForbiddenException extends ForbiddenException<'KNOWLEDGE_CONFIRMATION_FORBIDDEN'> {
  constructor() {
    super(
      'Only a maintainer can confirm an approved item still holds; a contributor or maintainer a draft',
      'KNOWLEDGE_CONFIRMATION_FORBIDDEN',
    );
  }
}
