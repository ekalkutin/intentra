import { WorkspaceCreationSettings } from '../../../domain/entities/index.js';

/** Holds the one Open Workspace Creation setting. */
export abstract class WorkspaceCreationSettingsRepository {
  abstract save(settings: WorkspaceCreationSettings): Promise<void>;
  /** Null until a Platform Admin first sets it. */
  abstract findOne(): Promise<WorkspaceCreationSettings | null>;

  /** Off until a Platform Admin turns it on. */
  public async getOne(): Promise<WorkspaceCreationSettings> {
    return (await this.findOne()) ?? WorkspaceCreationSettings.closed();
  }
}
