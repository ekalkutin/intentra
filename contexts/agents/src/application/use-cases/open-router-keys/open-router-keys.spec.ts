import { describe, expect, it } from 'vitest';

import type { WorkspaceId } from '@intentra/shared';

import type { OpenRouterKey } from '../../../domain/entities/index.js';
import { OpenRouterKeyNotFoundException } from '../../exceptions/index.js';
import { OpenRouterKeyRepository, SecretCipher } from '../../ports/index.js';

import {
  FindOneOpenRouterKeyQuery,
  FindOneOpenRouterKeyQueryHandler,
} from './find-one-open-router-key/find-one-open-router-key.query.js';
import {
  RemoveOpenRouterKeyCommand,
  RemoveOpenRouterKeyCommandHandler,
} from './remove-open-router-key/remove-open-router-key.command.js';
import {
  SetOpenRouterKeyCommand,
  SetOpenRouterKeyCommandHandler,
} from './set-open-router-key/set-open-router-key.command.js';

class InMemoryOpenRouterKeyRepository extends OpenRouterKeyRepository {
  readonly saved = new Map<string, OpenRouterKey>();

  async save(key: OpenRouterKey): Promise<void> {
    this.saved.set(key.id.value, key);
  }
  async findByWorkspace(
    workspaceId: WorkspaceId,
  ): Promise<OpenRouterKey | null> {
    return this.saved.get(workspaceId.value) ?? null;
  }
  async remove(workspaceId: WorkspaceId): Promise<boolean> {
    return this.saved.delete(workspaceId.value);
  }
}

class ReversingCipher extends SecretCipher {
  encrypt(plaintext: string): string {
    return [...plaintext].reverse().join('');
  }
  decrypt(ciphertext: string): string {
    return this.encrypt(ciphertext);
  }
}

function setup() {
  const repository = new InMemoryOpenRouterKeyRepository();
  return {
    repository,
    set: new SetOpenRouterKeyCommandHandler(repository, new ReversingCipher()),
    remove: new RemoveOpenRouterKeyCommandHandler(repository),
    find: new FindOneOpenRouterKeyQueryHandler(repository),
  };
}

describe('OpenRouter keys', () => {
  it('stores the key encrypted and shows only its hint', async () => {
    const { set, find, repository } = setup();

    await set.execute(
      new SetOpenRouterKeyCommand('ws-1', { apiKey: 'sk-or-v1-abcd' }),
    );

    expect(repository.saved.get('ws-1')?.key.ciphertext).toBe('dcba-1v-ro-ks');
    const key = await find.execute(new FindOneOpenRouterKeyQuery('ws-1'));
    expect(key?.hint).toBe('abcd');
    expect(JSON.stringify(key)).not.toContain('sk-or');
  });

  it('replaces the key there is', async () => {
    const { set, find } = setup();
    await set.execute(
      new SetOpenRouterKeyCommand('ws-1', { apiKey: 'sk-or-v1-1111' }),
    );

    await set.execute(
      new SetOpenRouterKeyCommand('ws-1', { apiKey: 'sk-or-v1-2222' }),
    );

    const key = await find.execute(new FindOneOpenRouterKeyQuery('ws-1'));
    expect(key?.hint).toBe('2222');
  });

  it('finds nothing once removed, and cannot remove twice', async () => {
    const { set, remove, find } = setup();
    await set.execute(
      new SetOpenRouterKeyCommand('ws-1', { apiKey: 'sk-or-v1-abcd' }),
    );

    await remove.execute(new RemoveOpenRouterKeyCommand('ws-1'));

    expect(
      await find.execute(new FindOneOpenRouterKeyQuery('ws-1')),
    ).toBeNull();
    await expect(
      remove.execute(new RemoveOpenRouterKeyCommand('ws-1')),
    ).rejects.toThrow(OpenRouterKeyNotFoundException);
  });
});
