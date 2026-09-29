import { BaseException } from '@intentra/shared-kernel';

export class NoUnitOfWorkException extends BaseException<'NO_UNIT_OF_WORK'> {
  constructor() {
    super(
      'Writing outside a unit of work: wrap the call in UnitOfWork.run()',
      'NO_UNIT_OF_WORK',
    );
  }
}
