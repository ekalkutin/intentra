import { NotFoundException } from '@intentra/shared-kernel';

export class ProviderKeyNotFoundException extends NotFoundException<'PROVIDER_KEY_NOT_FOUND'> {
  constructor() {
    super('The workspace has no provider key', 'PROVIDER_KEY_NOT_FOUND');
  }
}
