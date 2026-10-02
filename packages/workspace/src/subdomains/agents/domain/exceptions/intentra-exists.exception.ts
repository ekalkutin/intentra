import { ConflictException } from '@intentra/shared-kernel';

export class IntentraExistsException extends ConflictException<'INTENTRA_EXISTS'> {
  constructor() {
    super(
      'There is already Intentra: change it instead of adding another',
      'INTENTRA_EXISTS',
    );
  }
}
