import { ForbiddenException } from '@intentra/shared-kernel';

export class ProviderKeyManagementForbiddenException extends ForbiddenException<'PROVIDER_KEY_MANAGEMENT_FORBIDDEN'> {
  constructor() {
    super(
      'Only an owner of the workspace can add, replace or remove its provider key',
      'PROVIDER_KEY_MANAGEMENT_FORBIDDEN',
    );
  }
}
