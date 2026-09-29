import { DomainException } from '@intentra/shared-kernel';

export class WorkspaceSlugMismatchException extends DomainException<'WORKSPACE_SLUG_MISMATCH'> {
  constructor() {
    super(
      'Type the workspace slug to confirm the deletion',
      'WORKSPACE_SLUG_MISMATCH',
    );
  }
}
