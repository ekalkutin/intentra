import { ApplicationException } from '@intentra/shared-kernel';

export class ProviderKeyMissingException extends ApplicationException<'PROVIDER_KEY_MISSING'> {
  constructor() {
    super(
      'Agents need a provider key; an owner of the workspace can add one',
      'PROVIDER_KEY_MISSING',
    );
  }
}
