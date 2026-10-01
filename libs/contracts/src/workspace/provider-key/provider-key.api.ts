import type { Actor } from '../../iam/index.js';

import type { ProviderKeyDto } from './provider-key.dto.js';
import type { SetProviderKeyDto } from './set-provider-key.dto.js';

/** The Workspace's one key to OpenRouter, on which its Agents run. */
export abstract class ProviderKeyApi {
  /** Any Active Member; 404 `PROVIDER_KEY_NOT_FOUND` while the Workspace has none. */
  abstract get(actor: Actor, workspaceId: string): Promise<ProviderKeyDto>;

  /** An Owner adds the key or replaces the one there; the key is checked with OpenRouter first. */
  abstract set(
    actor: Actor,
    workspaceId: string,
    data: SetProviderKeyDto,
  ): Promise<ProviderKeyDto>;

  /** An Owner removes the key; the Workspace's Agents stop working until one is added again. */
  abstract remove(actor: Actor, workspaceId: string): Promise<void>;
}
