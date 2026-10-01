import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { MongooseUnitOfWork } from '@intentra/platform-persistence';

import { SignUpSettingsRepository } from '../../../application/ports/outbound/index.js';
import { SignUpSettings } from '../../../domain/entities/index.js';
import { SignUpSettingsModel } from '../../database/index.js';

/** The one document's key. */
const ID = 'sign-up';

@Injectable()
export class SignUpSettingsRepositoryAdapter extends SignUpSettingsRepository {
  constructor(
    @InjectModel(SignUpSettingsModel.name)
    private readonly signUpSettingsModel: Model<SignUpSettingsModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {
    super();
  }

  public async save(settings: SignUpSettings): Promise<void> {
    await this.signUpSettingsModel
      .replaceOne(
        { _id: ID },
        { open: settings.isOpen },
        { upsert: true, session: this.unitOfWork.requireSession() },
      )
      .exec();
  }

  public async findOne(): Promise<SignUpSettings | null> {
    const document = await this.signUpSettingsModel
      .findOne({ _id: ID })
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return document && this.toDomain(document);
  }

  private toDomain(document: SignUpSettingsModel): SignUpSettings {
    return SignUpSettings.restore({ open: document.open });
  }
}

export const SIGN_UP_SETTINGS_REPOSITORY_PROVIDER: Provider = {
  provide: SignUpSettingsRepository,
  useClass: SignUpSettingsRepositoryAdapter,
};
