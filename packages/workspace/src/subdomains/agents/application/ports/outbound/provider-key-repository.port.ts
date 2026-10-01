import type { WorkspaceId } from '@intentra/shared-kernel';

import { ProviderKey } from '../../../domain/entities/index.js';
import type { ProviderKeyId } from '../../../domain/value-objects/index.js';
import { ProviderKeyNotFoundException } from '../../exceptions/index.js';

export type ProviderKeyQueryProps = {
  readonly workspaceId: WorkspaceId;
};

export abstract class ProviderKeyRepository {
  abstract save(key: ProviderKey): Promise<void>;
  abstract findOne(props: ProviderKeyQueryProps): Promise<ProviderKey | null>;
  abstract delete(id: ProviderKeyId): Promise<void>;
  abstract deleteMany(props: {
    readonly workspaceId: WorkspaceId;
  }): Promise<void>;

  public async getOne(props: ProviderKeyQueryProps): Promise<ProviderKey> {
    const key = await this.findOne(props);
    if (!key) {
      throw new ProviderKeyNotFoundException();
    }

    return key;
  }
}
