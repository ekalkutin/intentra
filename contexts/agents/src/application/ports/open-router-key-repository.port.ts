import type { WorkspaceId } from '@intentra/shared';

import type { OpenRouterKey } from '../../domain/entities/index.js';
import { OpenRouterKeyNotFoundException } from '../exceptions/index.js';

export abstract class OpenRouterKeyRepository {
  abstract save(key: OpenRouterKey): Promise<void>;
  abstract findByWorkspace(
    workspaceId: WorkspaceId,
  ): Promise<OpenRouterKey | null>;
  /** `false` when there was nothing to remove. */
  abstract remove(workspaceId: WorkspaceId): Promise<boolean>;

  public async getByWorkspace(
    workspaceId: WorkspaceId,
  ): Promise<OpenRouterKey> {
    const key = await this.findByWorkspace(workspaceId);
    if (!key) {
      throw new OpenRouterKeyNotFoundException(workspaceId.value);
    }
    return key;
  }
}
