import { ConflictException } from '@intentra/shared-kernel';

import type { PublishingProblem } from '../value-objects/index.js';

export class AgentsNotPublishableException extends ConflictException<'AGENTS_NOT_PUBLISHABLE'> {
  constructor(problems: readonly PublishingProblem[]) {
    super(
      `The Agents cannot be published: ${problems.map(problem => problem.describe()).join('; ')}`,
      'AGENTS_NOT_PUBLISHABLE',
    );
  }
}
