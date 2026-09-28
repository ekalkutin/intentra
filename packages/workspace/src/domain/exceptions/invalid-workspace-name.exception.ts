import { DomainException } from '@intentra/shared-kernel';

export class InvalidWorkspaceNameException extends DomainException<'INVALID_WORKSPACE_NAME'> {
  constructor() {
    super(
      'Workspace name must be 1 to 100 characters long',
      'INVALID_WORKSPACE_NAME',
    );
  }
}
