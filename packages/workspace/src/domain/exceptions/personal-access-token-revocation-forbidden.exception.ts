import { ForbiddenException } from '@intentra/shared-kernel';

export class PersonalAccessTokenRevocationForbiddenException extends ForbiddenException<'PERSONAL_ACCESS_TOKEN_REVOCATION_FORBIDDEN'> {
  constructor() {
    super(
      'Only the member who created a personal access token, or an owner of the workspace, can revoke it',
      'PERSONAL_ACCESS_TOKEN_REVOCATION_FORBIDDEN',
    );
  }
}
