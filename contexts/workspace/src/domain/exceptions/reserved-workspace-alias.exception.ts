import { DomainException } from '@intentra/shared';

export class ReservedWorkspaceAliasException extends DomainException<'RESERVED_WORKSPACE_ALIAS'> {
  constructor(alias: string) {
    super(`Alias "${alias}" is reserved`, 'RESERVED_WORKSPACE_ALIAS');
  }
}
