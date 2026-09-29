import { ForbiddenException } from '@intentra/shared-kernel';

export class KnowledgeRetirementForbiddenException extends ForbiddenException<'KNOWLEDGE_RETIREMENT_FORBIDDEN'> {
  constructor() {
    super(
      'Only a maintainer of the project can retire knowledge',
      'KNOWLEDGE_RETIREMENT_FORBIDDEN',
    );
  }
}
