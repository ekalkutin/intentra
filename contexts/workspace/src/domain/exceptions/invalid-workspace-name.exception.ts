import { DomainException } from '@intentra/shared';

export class InvalidWorkspaceNameException extends DomainException<'INVALID_WORKSPACE_NAME'> {
  constructor(maxLength: number) {
    super(
      `Workspace name must be 1 to ${maxLength} characters long`,
      'INVALID_WORKSPACE_NAME',
    );
  }
}
