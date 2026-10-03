import { ForbiddenException } from '@intentra/shared-kernel';

export class FeatureAssignmentForbiddenException extends ForbiddenException<'FEATURE_ASSIGNMENT_FORBIDDEN'> {
  constructor() {
    super(
      'Only a maintainer of the project can put approved knowledge into a feature',
      'FEATURE_ASSIGNMENT_FORBIDDEN',
    );
  }
}
