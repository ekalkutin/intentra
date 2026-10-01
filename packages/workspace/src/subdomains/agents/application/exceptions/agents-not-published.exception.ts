import { ApplicationException } from '@intentra/shared-kernel';

export class AgentsNotPublishedException extends ApplicationException<'AGENTS_NOT_PUBLISHED'> {
  constructor() {
    super("Intentra's Agents are not published yet", 'AGENTS_NOT_PUBLISHED');
  }
}
