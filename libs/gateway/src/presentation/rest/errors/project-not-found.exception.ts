import { HttpStatus } from '@nestjs/common';

import { GatewayException } from './gateway.exception.js';

/** The same answer Workspace gives for a Project that is missing or not the caller's to see. */
export class ProjectNotFoundException extends GatewayException<'PROJECT_NOT_FOUND'> {
  constructor() {
    super('Project not found', 'PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}
