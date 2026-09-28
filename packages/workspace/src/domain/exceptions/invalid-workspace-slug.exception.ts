import { DomainException } from '@intentra/shared-kernel';

export class InvalidWorkspaceSlugException extends DomainException<'INVALID_WORKSPACE_SLUG'> {
  constructor() {
    super(
      'Workspace slug must be 3 to 15 lowercase letters, digits or single hyphens',
      'INVALID_WORKSPACE_SLUG',
    );
  }
}
