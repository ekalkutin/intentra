import { ConflictException } from '@intentra/shared-kernel';

export class ProjectSlugTakenException extends ConflictException<'PROJECT_SLUG_TAKEN'> {
  constructor() {
    super(
      'Another project in this workspace already uses this slug',
      'PROJECT_SLUG_TAKEN',
    );
  }
}
