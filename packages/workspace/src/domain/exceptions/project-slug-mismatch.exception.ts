import { DomainException } from '@intentra/shared-kernel';

export class ProjectSlugMismatchException extends DomainException<'PROJECT_SLUG_MISMATCH'> {
  constructor() {
    super(
      'Type the project slug to confirm the deletion',
      'PROJECT_SLUG_MISMATCH',
    );
  }
}
