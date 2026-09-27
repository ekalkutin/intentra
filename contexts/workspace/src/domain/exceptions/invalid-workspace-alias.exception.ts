import { DomainException } from '@intentra/shared';

export class InvalidWorkspaceAliasException extends DomainException<'INVALID_WORKSPACE_ALIAS'> {
  constructor(minLength: number, maxLength: number) {
    super(
      `Alias must be ${minLength} to ${maxLength} lowercase letters, digits and single hyphens`,
      'INVALID_WORKSPACE_ALIAS',
    );
  }
}
