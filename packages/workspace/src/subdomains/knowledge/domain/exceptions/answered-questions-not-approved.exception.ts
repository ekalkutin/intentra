import { ConflictException } from '@intentra/shared-kernel';

export class AnsweredQuestionsNotApprovedException extends ConflictException<'ANSWERED_QUESTIONS_NOT_APPROVED'> {
  constructor(keys: readonly string[]) {
    super(
      `Approve the Draft Open Questions it answers together with it: ${keys.join(', ')}`,
      'ANSWERED_QUESTIONS_NOT_APPROVED',
    );
  }
}
