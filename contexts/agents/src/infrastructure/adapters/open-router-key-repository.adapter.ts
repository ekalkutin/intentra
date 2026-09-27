import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Timestamp, WorkspaceId } from '@intentra/shared';

import { OpenRouterKeyRepository } from '../../application/ports/index.js';
import { OpenRouterKey } from '../../domain/entities/index.js';
import { EncryptedApiKey } from '../../domain/value-objects/index.js';
import { OpenRouterKeyModel } from '../database/index.js';

@Injectable()
export class OpenRouterKeyRepositoryAdapter extends OpenRouterKeyRepository {
  constructor(
    @InjectModel(OpenRouterKeyModel.name)
    private readonly openRouterKeyModel: Model<OpenRouterKeyModel>,
  ) {
    super();
  }

  public async save(key: OpenRouterKey): Promise<void> {
    await this.openRouterKeyModel
      .replaceOne(
        { _id: key.id.value },
        {
          _id: key.id.value,
          ciphertext: key.key.ciphertext,
          hint: key.key.hint,
          updatedAt: key.updatedAt.toDate(),
        },
        { upsert: true },
      )
      .exec();
  }

  public async findByWorkspace(
    workspaceId: WorkspaceId,
  ): Promise<OpenRouterKey | null> {
    const key = await this.openRouterKeyModel
      .findById(workspaceId.value)
      .exec();
    return key
      ? OpenRouterKey.reconstitute(
          workspaceId,
          new EncryptedApiKey(key.ciphertext, key.hint),
          Timestamp.fromDate(key.updatedAt),
        )
      : null;
  }

  public async remove(workspaceId: WorkspaceId): Promise<boolean> {
    const { deletedCount } = await this.openRouterKeyModel
      .deleteOne({ _id: workspaceId.value })
      .exec();
    return deletedCount > 0;
  }
}
