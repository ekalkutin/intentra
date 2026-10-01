import { ForbiddenException } from '@intentra/shared-kernel';

export class WorkspaceSuspendedException extends ForbiddenException<'WORKSPACE_SUSPENDED'> {
  constructor() {
    super(
      'The workspace is suspended: nothing in it can be changed until it is resumed',
      'WORKSPACE_SUSPENDED',
    );
  }
}
