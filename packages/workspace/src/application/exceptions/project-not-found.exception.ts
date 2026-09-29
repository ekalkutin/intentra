import { NotFoundException } from '@intentra/shared-kernel';

export class ProjectNotFoundException extends NotFoundException<'PROJECT_NOT_FOUND'> {
  constructor() {
    super('Project not found', 'PROJECT_NOT_FOUND');
  }
}
