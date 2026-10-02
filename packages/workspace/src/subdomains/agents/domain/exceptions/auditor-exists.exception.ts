import { ConflictException } from '@intentra/shared-kernel';

export class AuditorExistsException extends ConflictException<'AUDITOR_EXISTS'> {
  constructor() {
    super(
      'There is already an Auditor: change it instead of adding another',
      'AUDITOR_EXISTS',
    );
  }
}
