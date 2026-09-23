import { Workspace } from '../../domain/entities/workspace.aggregate.js';

export abstract class WorkspaceRepository {
  abstract save(workspace: Workspace): Promise<void>;
  abstract find(): Promise<Workspace[]>;
}
