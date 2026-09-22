import { AccountIdentity } from '../dto/access/identity.js';
import { CreateWorkspaceDto, WorkspaceDto } from '../dto/workspace.js';

export interface WorkspacesApi {
  create(
    dto: CreateWorkspaceDto,
    identity: AccountIdentity,
  ): Promise<WorkspaceDto>;
  /** Те workspace, в которых человек состоит. Не «все», даже для платформенного администратора. */
  findMine(identity: AccountIdentity): Promise<WorkspaceDto[]>;
}
