import { NotFoundException } from '@intentra/shared-kernel';

export class PersonalAccessTokenNotFoundException extends NotFoundException<'PERSONAL_ACCESS_TOKEN_NOT_FOUND'> {
  constructor() {
    super('Personal access token not found', 'PERSONAL_ACCESS_TOKEN_NOT_FOUND');
  }
}
