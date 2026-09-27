import { ConflictException } from '@intentra/shared';

export class WorkspaceAliasAlreadyTakenException extends ConflictException<'WORKSPACE_ALIAS_ALREADY_TAKEN'> {
  constructor() {
    super('Alias is already taken', 'WORKSPACE_ALIAS_ALREADY_TAKEN');
  }
}
