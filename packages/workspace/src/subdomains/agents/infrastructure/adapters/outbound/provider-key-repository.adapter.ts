import { Injectable, Provider } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { MongooseUnitOfWork } from '@intentra/platform-persistence';
import type { WorkspaceId } from '@intentra/shared-kernel';

import {
  ProviderKeyRepository,
  type ProviderKeyQueryProps,
} from '../../../application/ports/outbound/index.js';
import { ProviderKey } from '../../../domain/entities/index.js';
import type { ProviderKeyId } from '../../../domain/value-objects/index.js';
import { ProviderKeyModel } from '../../database/index.js';

@Injectable()
export class ProviderKeyRepositoryAdapter extends ProviderKeyRepository {
  constructor(
    @InjectModel(ProviderKeyModel.name)
    private readonly providerKeyModel: Model<ProviderKeyModel>,
    private readonly unitOfWork: MongooseUnitOfWork,
  ) {
    super();
  }

  public async save(key: ProviderKey): Promise<void> {
    await this.providerKeyModel
      .replaceOne(
        { _id: key.id.value },
        {
          workspaceId: key.workspaceId.value,
          encryptedKey: key.encryptedKey.value,
          hint: key.hint.value,
          addedBy: key.addedBy.value,
          addedAt: toDate(key.addedAt),
        },
        { upsert: true, session: this.unitOfWork.requireSession() },
      )
      .exec();
  }

  public async findOne(
    props: ProviderKeyQueryProps,
  ): Promise<ProviderKey | null> {
    const document = await this.providerKeyModel
      .findOne({ workspaceId: props.workspaceId.value })
      .session(this.unitOfWork.session)
      .lean()
      .exec();

    return document && this.toDomain(document);
  }

  public async delete(id: ProviderKeyId): Promise<void> {
    await this.providerKeyModel
      .deleteOne({ _id: id.value })
      .session(this.unitOfWork.requireSession())
      .exec();
  }

  public async deleteMany(props: {
    readonly workspaceId: WorkspaceId;
  }): Promise<void> {
    await this.providerKeyModel
      .deleteMany({ workspaceId: props.workspaceId.value })
      .session(this.unitOfWork.requireSession())
      .exec();
  }

  private toDomain(document: ProviderKeyModel): ProviderKey {
    return ProviderKey.restore({
      id: document._id.toHexString(),
      workspaceId: document.workspaceId.toHexString(),
      encryptedKey: document.encryptedKey,
      hint: document.hint,
      addedBy: document.addedBy.toHexString(),
      addedAt: Temporal.Instant.fromEpochMilliseconds(
        document.addedAt.getTime(),
      ),
    });
  }
}

function toDate(instant: Temporal.Instant): Date {
  return new Date(instant.epochMilliseconds);
}

export const PROVIDER_KEY_REPOSITORY_PROVIDER: Provider = {
  provide: ProviderKeyRepository,
  useClass: ProviderKeyRepositoryAdapter,
};
