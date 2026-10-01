import { ConflictException } from '@intentra/shared-kernel';

export class AgentsNotPublishableException extends ConflictException<'AGENTS_NOT_PUBLISHABLE'> {
  constructor(problems: readonly string[]) {
    super(
      `The Agents cannot be published: ${problems.join('; ')}`,
      'AGENTS_NOT_PUBLISHABLE',
    );
  }
}
