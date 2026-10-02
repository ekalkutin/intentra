import { ConflictException } from '@intentra/shared-kernel';

export class AuditorNotRemovableException extends ConflictException<'AUDITOR_NOT_REMOVABLE'> {
  constructor() {
    super(
      'There is always one Auditor: it can be changed but not removed',
      'AUDITOR_NOT_REMOVABLE',
    );
  }
}
