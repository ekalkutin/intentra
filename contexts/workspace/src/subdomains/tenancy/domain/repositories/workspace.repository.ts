import { Workspace } from '../entities/index.js';

export abstract class WorkspaceRepository {
  abstract save(workspace: Workspace): Promise<void>;
  abstract getById(id: string): Promise<Workspace>;
  abstract findById(id: string): Promise<Workspace | null>;
  /** Только те, в которых человек состоит: «все workspace» — вопрос платформенного фасада, не этого метода. */
  abstract findByMember(accountId: string): Promise<Workspace[]>;
}
