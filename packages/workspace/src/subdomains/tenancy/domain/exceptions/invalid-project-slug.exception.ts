import { DomainException } from '@intentra/shared-kernel';

export class InvalidProjectSlugException extends DomainException<'INVALID_PROJECT_SLUG'> {
  constructor() {
    super(
      'Project slug must be 3 to 15 lowercase letters, digits or single hyphens',
      'INVALID_PROJECT_SLUG',
    );
  }
}
