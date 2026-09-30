import { ConflictException } from '@intentra/shared-kernel';

export class WorkspaceSlugTakenException extends ConflictException<'WORKSPACE_SLUG_TAKEN'> {
  constructor() {
    super('Another workspace already uses this slug', 'WORKSPACE_SLUG_TAKEN');
  }
}
