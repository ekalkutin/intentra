import { Aggregate, Timestamp, WorkspaceId } from '@intentra/shared';

import type { EncryptedApiKey } from '../value-objects/index.js';

/**
 * The OpenRouter key all agents of a workspace run on. One per workspace, so
 * it is identified by the workspace itself.
 */
export class OpenRouterKey extends Aggregate<WorkspaceId> {
  #key: EncryptedApiKey;
  #updatedAt: Timestamp;

  private constructor(
    workspaceId: WorkspaceId,
    key: EncryptedApiKey,
    updatedAt: Timestamp,
  ) {
    super(workspaceId);
    this.#key = key;
    this.#updatedAt = updatedAt;
  }

  get key(): EncryptedApiKey {
    return this.#key;
  }

  get updatedAt(): Timestamp {
    return this.#updatedAt;
  }

  public replace(key: EncryptedApiKey): void {
    this.#key = key;
    this.#updatedAt = Timestamp.now();
  }

  public static create(
    workspaceId: WorkspaceId,
    key: EncryptedApiKey,
  ): OpenRouterKey {
    return new OpenRouterKey(workspaceId, key, Timestamp.now());
  }

  public static reconstitute(
    workspaceId: WorkspaceId,
    key: EncryptedApiKey,
    updatedAt: Timestamp,
  ): OpenRouterKey {
    return new OpenRouterKey(workspaceId, key, updatedAt);
  }
}
