import type { Actor } from '../../iam/index.js';

import type { WorkspaceAccessDto } from './workspace-access.dto.js';

export abstract class AccessApi {
  abstract get(actor: Actor, workspaceId: string): Promise<WorkspaceAccessDto>;
}
