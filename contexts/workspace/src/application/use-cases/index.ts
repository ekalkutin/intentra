import { Provider } from '@nestjs/common';

import { PROJECTS_CQRS_HANDLERS } from './projects/index.js';
import { WORKSPACES_CQRS_HANDLERS } from './workspaces/index.js';

export const CQRS_HANDLERS: Provider[] = [
  ...WORKSPACES_CQRS_HANDLERS,
  ...PROJECTS_CQRS_HANDLERS,
];
