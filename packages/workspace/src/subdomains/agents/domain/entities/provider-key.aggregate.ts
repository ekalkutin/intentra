import { Aggregate, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId } from '../../../tenancy/index.js';
import {
  EncryptedProviderKey,
  ProviderKeyHint,
  ProviderKeyId,
} from '../value-objects/index.js';

/**
 * A Workspace's own key to its LLM provider (OpenRouter for now), at most one
 * per Workspace. Every model call of the Workspace's Agents runs on it.
 */
export class ProviderKey extends Aggregate<ProviderKeyId> {
  readonly #workspaceId: WorkspaceId;
  #encryptedKey: EncryptedProviderKey;
  #hint: ProviderKeyHint;
  #addedBy: MemberId;
  #addedAt: Temporal.Instant;

  private constructor(id: ProviderKeyId, state: ProviderKeyState) {
    super(id);
    this.#workspaceId = state.workspaceId;
    this.#encryptedKey = state.encryptedKey;
    this.#hint = state.hint;
    this.#addedBy = state.addedBy;
    this.#addedAt = state.addedAt;
  }

  get workspaceId(): WorkspaceId {
    return this.#workspaceId;
  }

  get encryptedKey(): EncryptedProviderKey {
    return this.#encryptedKey;
  }

  get hint(): ProviderKeyHint {
    return this.#hint;
  }

  /** The Member who added the key now in use. */
  get addedBy(): MemberId {
    return this.#addedBy;
  }

  get addedAt(): Temporal.Instant {
    return this.#addedAt;
  }

  public static add(props: ProviderKeyAddProps): ProviderKey {
    return new ProviderKey(new ProviderKeyId(), {
      workspaceId: new WorkspaceId(props.workspaceId),
      encryptedKey: new EncryptedProviderKey(props.encryptedKey),
      hint: new ProviderKeyHint(props.hint),
      addedBy: new MemberId(props.addedBy),
      addedAt: Temporal.Now.instant(),
    });
  }

  public static restore(props: ProviderKeyRestoreProps): ProviderKey {
    return new ProviderKey(new ProviderKeyId(props.id), {
      workspaceId: new WorkspaceId(props.workspaceId),
      encryptedKey: new EncryptedProviderKey(props.encryptedKey),
      hint: new ProviderKeyHint(props.hint),
      addedBy: new MemberId(props.addedBy),
      addedAt: props.addedAt,
    });
  }

  /** Another key takes this one's place; the old one is gone for good. */
  public replace(
    encryptedKey: EncryptedProviderKey,
    hint: ProviderKeyHint,
    addedBy: MemberId,
  ): void {
    this.#encryptedKey = encryptedKey;
    this.#hint = hint;
    this.#addedBy = addedBy;
    this.#addedAt = Temporal.Now.instant();
  }
}

type ProviderKeyState = {
  readonly workspaceId: WorkspaceId;
  readonly encryptedKey: EncryptedProviderKey;
  readonly hint: ProviderKeyHint;
  readonly addedBy: MemberId;
  readonly addedAt: Temporal.Instant;
};
type ProviderKeyAddProps = {
  readonly workspaceId: string;
  readonly encryptedKey: string;
  readonly hint: string;
  readonly addedBy: string;
};
type ProviderKeyRestoreProps = ProviderKeyAddProps & {
  readonly id: string;
  readonly addedAt: Temporal.Instant;
};
