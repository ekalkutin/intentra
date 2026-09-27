import { NotFoundException } from '@intentra/shared';

/** Also thrown for a token of another account: no hints. */
export class PersonalAccessTokenNotFoundException extends NotFoundException<'PERSONAL_ACCESS_TOKEN_NOT_FOUND'> {
  constructor(personalAccessTokenId: string) {
    super(
      `Personal access token ${personalAccessTokenId} not found`,
      'PERSONAL_ACCESS_TOKEN_NOT_FOUND',
    );
  }
}
