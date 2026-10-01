import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

import type { TestingApp } from '@intentra/platform-testing';

/**
 * Turns Open Workspace Creation on or off, as a Platform Admin would; it is
 * off until turned on. Written straight to Workspace's
 * `workspace_creation_settings`, since a test cleans the database between
 * cases.
 */
export async function setOpenWorkspaceCreation(
  app: TestingApp,
  open: boolean,
): Promise<void> {
  await app
    .get<Connection>(getConnectionToken())
    .collection<{ _id: string; open: boolean }>('workspace_creation_settings')
    .updateOne(
      { _id: 'workspace-creation' },
      { $set: { open } },
      { upsert: true },
    );
}
