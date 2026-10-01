import { ConflictException } from '@intentra/shared-kernel';

export class UnpublishedAgentsChangedException extends ConflictException<'UNPUBLISHED_AGENTS_CHANGED'> {
  constructor() {
    super(
      'The Unpublished Agents hold changes: publish or undo them first, or they would be lost',
      'UNPUBLISHED_AGENTS_CHANGED',
    );
  }
}
