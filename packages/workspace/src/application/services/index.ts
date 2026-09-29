import { Provider } from '@nestjs/common';

import { WorkspacesService } from './workspaces.service.js';

export { WorkspacesService };

export const APPLICATION_SERVICES: Provider[] = [WorkspacesService];
