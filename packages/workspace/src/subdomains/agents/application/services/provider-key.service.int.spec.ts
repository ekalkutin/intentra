import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type { Actor } from '@intentra/contracts/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceId } from '@intentra/shared-kernel';

import { givenAccount } from '../../../../testing/account.fixtures.js';
import { WorkspaceModule } from '../../../../workspace.module.js';
import { WorkspacesService } from '../../../tenancy/index.js';
import {
  ProviderKeyCipher,
  ProviderKeyRepository,
} from '../ports/outbound/index.js';

import { ProviderKeyService } from './provider-key.service.js';

const KEY = 'sk-or-v1-0123456789abcdef';

describe('ProviderKeyService integration', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({
      imports: [
        WorkspaceModule.register({
          agents: {
            providerKeyEncryptionKey: Buffer.alloc(32, 7).toString('base64'),
          },
        }),
      ],
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await app.clearDatabase();
  });

  afterAll(() => app?.close());

  /** Ada owns the Workspace and has added a key that OpenRouter accepted. */
  async function setUp(): Promise<{ ada: Actor; workspaceId: string }> {
    const ada = await givenAccount(app, 'ada@example.com');
    const workspace = await app
      .get(WorkspacesService)
      .create(ada, { name: 'Acme', slug: 'acme' });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 200 }),
    );
    await app.get(ProviderKeyService).set(ada, workspace.id, { key: KEY });

    return { ada, workspaceId: workspace.id };
  }

  it('keeps the key encrypted, readable only with the server secret', async () => {
    // Arrange
    const { workspaceId } = await setUp();

    // Act
    const stored = await app
      .get(ProviderKeyRepository)
      .getOne({ workspaceId: new WorkspaceId(workspaceId) });

    // Assert
    expect(stored.encryptedKey.value).not.toContain(KEY);
    expect(app.get(ProviderKeyCipher).decrypt(stored.encryptedKey).value).toBe(
      KEY,
    );
  });

  it('is deleted with its Workspace', async () => {
    // Arrange
    const { ada, workspaceId } = await setUp();

    // Act
    await app.get(WorkspacesService).delete(ada, workspaceId, { slug: 'acme' });

    // Assert
    const stored = await app
      .get(ProviderKeyRepository)
      .findOne({ workspaceId: new WorkspaceId(workspaceId) });
    expect(stored).toBeNull();
  });
});
