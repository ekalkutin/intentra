import type { Type } from '@nestjs/common';

import { PlatformAccountsController } from './platform-accounts.controller.js';
import { PlatformAgentsController } from './platform-agents.controller.js';
import { PlatformSignUpController } from './platform-sign-up.controller.js';
import { PlatformWorkspacesController } from './platform-workspaces.controller.js';

export const PLATFORM_CONTROLLERS: Type[] = [
  PlatformAgentsController,
  PlatformWorkspacesController,
  PlatformAccountsController,
  PlatformSignUpController,
];
