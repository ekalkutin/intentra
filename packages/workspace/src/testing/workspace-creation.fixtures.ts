import type { Actor } from '@intentra/contracts/iam';
import type { TestingApp } from '@intentra/platform-testing';
import { AccountId } from '@intentra/shared-kernel';

import { PlatformWorkspacesService } from '../platform-workspaces.service.js';

const PLATFORM_ADMIN: Actor = {
  accountId: new AccountId().value,
  email: 'admin@example.com',
  name: 'admin',
  isPlatformAdmin: true,
};

/**
 * Turns Open Workspace Creation on, as a Platform Admin would: it is off
 * until then, and a test cleans the database between cases.
 */
export async function givenOpenWorkspaceCreation(
  app: TestingApp,
): Promise<void> {
  await app
    .get(PlatformWorkspacesService)
    .setCreation(PLATFORM_ADMIN, { open: true });
}
