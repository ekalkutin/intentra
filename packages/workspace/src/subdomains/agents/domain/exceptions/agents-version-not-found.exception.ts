import { NotFoundException } from '@intentra/shared-kernel';

export class AgentsVersionNotFoundException extends NotFoundException<'AGENTS_VERSION_NOT_FOUND'> {
  constructor() {
    super('Agents version not found', 'AGENTS_VERSION_NOT_FOUND');
  }
}
