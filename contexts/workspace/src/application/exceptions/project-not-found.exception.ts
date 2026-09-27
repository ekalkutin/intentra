import { NotFoundException } from '@intentra/shared';

export class ProjectNotFoundException extends NotFoundException<'PROJECT_NOT_FOUND'> {
  constructor(projectId: string) {
    super(`Project ${projectId} not found`, 'PROJECT_NOT_FOUND');
  }
}
