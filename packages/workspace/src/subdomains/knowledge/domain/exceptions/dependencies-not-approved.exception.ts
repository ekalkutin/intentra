import { ConflictException } from '@intentra/shared-kernel';

export class DependenciesNotApprovedException extends ConflictException<'DEPENDENCIES_NOT_APPROVED'> {
  constructor(keys: readonly string[]) {
    super(
      `Approve what it depends on first, or together with it: ${keys.join(', ')}`,
      'DEPENDENCIES_NOT_APPROVED',
    );
  }
}
