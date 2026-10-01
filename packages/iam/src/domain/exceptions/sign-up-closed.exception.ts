import { ForbiddenException } from '@intentra/shared-kernel';

export class SignUpClosedException extends ForbiddenException<'SIGN_UP_CLOSED'> {
  constructor() {
    super(
      'Signing up is by invitation only: ask a workspace owner to invite this email',
      'SIGN_UP_CLOSED',
    );
  }
}
