import { ConflictException } from '@intentra/shared-kernel';

export class IntentraNotRemovableException extends ConflictException<'INTENTRA_NOT_REMOVABLE'> {
  constructor() {
    super(
      'There is always one Intentra: it can be changed but not removed',
      'INTENTRA_NOT_REMOVABLE',
    );
  }
}
