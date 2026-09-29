import { ConflictException } from '@intentra/shared-kernel';

export class ProductOverviewAlreadyApprovedException extends ConflictException<'PRODUCT_OVERVIEW_ALREADY_APPROVED'> {
  constructor() {
    super(
      'A project has one approved product overview: record this one as its replacement',
      'PRODUCT_OVERVIEW_ALREADY_APPROVED',
    );
  }
}
