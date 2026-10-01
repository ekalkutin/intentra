import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { MongooseUnitOfWork } from '@intentra/platform-persistence';

import { WorkspaceCreationSettingsRepository } from '../../../application/ports/outbound/index.js';
import { WorkspaceCreationSettings } from '../../../domain/entities/index.js';
import { WorkspaceCreationSettingsModel } from '../../database/index.js';

/** The one document's key. */
const ID = 'workspace-creation';

@Injectable()
export class WorkspaceCreationSettingsRepositoryAdapter extends WorkspaceCreationSettingsRepository {
  constructor(
    @InjectModel(WorkspaceCreationSettingsModel.name)
    private readonly workspaceCreationSettingsModel: Model<WorkspaceCreationSettingsModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {
    super();
  }

  public async save(settings: WorkspaceCreationSettings): Promise<void> {
    await this.workspaceCreationSettingsModel
      .replaceOne(
        { _id: ID },
        { open: settings.isOpen },
        { upsert: true, session: this.unitOfWork.requireSession() },
      )
      .exec();
  }

  public async findOne(): Promise<WorkspaceCreationSettings | null> {
    const document = await this.workspaceCreationSettingsModel
      .findOne({ _id: ID })
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return document && this.toDomain(document);
  }

  private toDomain(
    document: WorkspaceCreationSettingsModel,
  ): WorkspaceCreationSettings {
    return WorkspaceCreationSettings.restore({ open: document.open });
  }
}

export const WORKSPACE_CREATION_SETTINGS_REPOSITORY_PROVIDER: Provider = {
  provide: WorkspaceCreationSettingsRepository,
  useClass: WorkspaceCreationSettingsRepositoryAdapter,
};
