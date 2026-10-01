import { ConflictException } from '@intentra/shared-kernel';

export class AgentsUnchangedException extends ConflictException<'AGENTS_UNCHANGED'> {
  constructor() {
    super(
      'Nothing to publish: these are already the Published Agents',
      'AGENTS_UNCHANGED',
    );
  }
}
