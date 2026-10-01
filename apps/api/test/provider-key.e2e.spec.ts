import { HttpStatus } from '@nestjs/common';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceModule } from '@intentra/workspace';

const SIGN_UP_PATH = '/api/iam/auth/sign-up';
const SIGN_IN_PATH = '/api/iam/auth/sign-in';
const WORKSPACES_PATH = '/api/workspaces';

const OPENROUTER_KEY_URL = 'https://openrouter.ai/api/v1/key';
const KEY = 'sk-or-v1-0123456789abcdef';

function providerKeyPath(workspaceId: string): string {
  return `${WORKSPACES_PATH}/${workspaceId}/provider-key`;
}

/** OpenRouter, as the server asks it about a key. */
function openRouterAnswers(status: number) {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response('{}', { status }));
}

describe('/api/workspaces/:workspaceId/provider-key', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({
      imports: [
        GatewayModule.register({
          contexts: [
            IamModule.register({
              accessTokenSecret: 'test-access-secret',
              refreshTokenSecret: 'test-refresh-secret',
              accessTokenTtlSeconds: 900,
              refreshTokenTtlSeconds: 604800,
            }),
            WorkspaceModule.register({
              agents: {
                providerKeyEncryptionKey: Buffer.alloc(32, 7).toString(
                  'base64',
                ),
              },
            }),
          ],
        }),
      ],
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await app.clearDatabase();
  });

  afterAll(() => app?.close());

  async function signIn(email: string): Promise<string> {
    const credentials = { email, password: 'correct-horse-battery-staple' };
    await app.request().post(SIGN_UP_PATH).send(credentials);
    const response = await app
      .request()
      .post(SIGN_IN_PATH)
      .send(credentials)
      .expect(HttpStatus.OK);

    return `Bearer ${response.body.accessToken}`;
  }

  /** Ada owns the Workspace; Bob joined it by Invitation, without a Role. */
  async function setUp(): Promise<{
    ada: string;
    bob: string;
    workspaceId: string;
  }> {
    const ada = await signIn('ada@example.com');
    const bob = await signIn('bob@example.com');
    const workspace = await app
      .request()
      .post(WORKSPACES_PATH)
      .set('Authorization', ada)
      .send({ name: 'Acme', slug: 'acme' })
      .expect(HttpStatus.CREATED);
    const invitation = await app
      .request()
      .post(`${WORKSPACES_PATH}/${workspace.body.id}/invitations`)
      .set('Authorization', ada)
      .send({ email: 'bob@example.com' })
      .expect(HttpStatus.CREATED);
    await app
      .request()
      .post(`/api/invitations/${invitation.body.id}/accept`)
      .set('Authorization', bob)
      .expect(HttpStatus.OK);

    return { ada, bob, workspaceId: workspace.body.id };
  }

  function setKey(authorization: string, workspaceId: string, key = KEY) {
    return app
      .request()
      .put(providerKeyPath(workspaceId))
      .set('Authorization', authorization)
      .send({ key });
  }

  describe('PUT', () => {
    it('lets an Owner add a key that OpenRouter accepts, showing only its hint', async () => {
      // Arrange
      const { ada, workspaceId } = await setUp();
      const fetch = openRouterAnswers(HttpStatus.OK);

      // Act
      const response = await setKey(ada, workspaceId);

      // Assert
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual({
        hint: 'sk-or-v1-…cdef',
        addedByMemberId: expect.any(String),
        addedByEmail: 'ada@example.com',
        addedAt: expect.any(String),
      });
      expect(JSON.stringify(response.body)).not.toContain(KEY);
      expect(fetch).toHaveBeenCalledWith(
        OPENROUTER_KEY_URL,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${KEY}` },
        }),
      );
    });

    it('replaces the key already there', async () => {
      // Arrange
      const { ada, workspaceId } = await setUp();
      openRouterAnswers(HttpStatus.OK);
      await setKey(ada, workspaceId).expect(HttpStatus.OK);

      // Act
      const response = await setKey(
        ada,
        workspaceId,
        'sk-or-v1-fedcba9876543210',
      );

      // Assert
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.hint).toBe('sk-or-v1-…3210');
    });

    it('keeps nothing when OpenRouter rejects the key', async () => {
      // Arrange
      const { ada, workspaceId } = await setUp();
      openRouterAnswers(HttpStatus.UNAUTHORIZED);

      // Act
      const response = await setKey(ada, workspaceId);

      // Assert
      expect(response.status).toBe(HttpStatus.PRECONDITION_FAILED);
      expect(response.body.code).toBe('PROVIDER_KEY_REJECTED');
      await app
        .request()
        .get(providerKeyPath(workspaceId))
        .set('Authorization', ada)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('asks to try again when OpenRouter cannot tell', async () => {
      // Arrange
      const { ada, workspaceId } = await setUp();
      openRouterAnswers(HttpStatus.BAD_GATEWAY);

      // Act
      const response = await setKey(ada, workspaceId);

      // Assert
      expect(response.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      expect(response.body).toMatchObject({
        code: 'PROVIDER_UNAVAILABLE',
        retryable: true,
      });
    });

    it('asks to try again when OpenRouter cannot be reached', async () => {
      // Arrange
      const { ada, workspaceId } = await setUp();
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(
        new TypeError('fetch failed'),
      );

      // Act
      const response = await setKey(ada, workspaceId);

      // Assert
      expect(response.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      expect(response.body.code).toBe('PROVIDER_UNAVAILABLE');
    });

    it('refuses a Member who is not an Owner, without asking OpenRouter', async () => {
      // Arrange
      const { bob, workspaceId } = await setUp();
      const fetch = openRouterAnswers(HttpStatus.OK);

      // Act
      const response = await setKey(bob, workspaceId);

      // Assert
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(response.body.code).toBe('PROVIDER_KEY_MANAGEMENT_FORBIDDEN');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('refuses a key with spaces in it', async () => {
      // Arrange
      const { ada, workspaceId } = await setUp();
      const fetch = openRouterAnswers(HttpStatus.OK);

      // Act
      const response = await setKey(ada, workspaceId, 'sk-or-v1 0123456789');

      // Assert
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.code).toBe('INVALID_PROVIDER_KEY');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('hides the Workspace from an outsider', async () => {
      // Arrange
      const { workspaceId } = await setUp();
      const eve = await signIn('eve@example.com');

      // Act
      const response = await setKey(eve, workspaceId);

      // Assert
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.code).toBe('WORKSPACE_NOT_FOUND');
    });
  });

  describe('GET', () => {
    it('shows any Member the hint, who added the key and when', async () => {
      // Arrange
      const { ada, bob, workspaceId } = await setUp();
      openRouterAnswers(HttpStatus.OK);
      const added = await setKey(ada, workspaceId).expect(HttpStatus.OK);

      // Act
      const response = await app
        .request()
        .get(providerKeyPath(workspaceId))
        .set('Authorization', bob);

      // Assert
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(added.body);
    });

    it('answers 404 while the Workspace has no key', async () => {
      // Arrange
      const { ada, workspaceId } = await setUp();

      // Act
      const response = await app
        .request()
        .get(providerKeyPath(workspaceId))
        .set('Authorization', ada);

      // Assert
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.code).toBe('PROVIDER_KEY_NOT_FOUND');
    });
  });

  describe('DELETE', () => {
    it('lets an Owner remove the key', async () => {
      // Arrange
      const { ada, workspaceId } = await setUp();
      openRouterAnswers(HttpStatus.OK);
      await setKey(ada, workspaceId).expect(HttpStatus.OK);

      // Act
      const response = await app
        .request()
        .delete(providerKeyPath(workspaceId))
        .set('Authorization', ada);

      // Assert
      expect(response.status).toBe(HttpStatus.NO_CONTENT);
      await app
        .request()
        .get(providerKeyPath(workspaceId))
        .set('Authorization', ada)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('refuses a Member who is not an Owner', async () => {
      // Arrange
      const { ada, bob, workspaceId } = await setUp();
      openRouterAnswers(HttpStatus.OK);
      await setKey(ada, workspaceId).expect(HttpStatus.OK);

      // Act
      const response = await app
        .request()
        .delete(providerKeyPath(workspaceId))
        .set('Authorization', bob);

      // Assert
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(response.body.code).toBe('PROVIDER_KEY_MANAGEMENT_FORBIDDEN');
    });

    it('answers 404 while the Workspace has no key', async () => {
      // Arrange
      const { ada, workspaceId } = await setUp();

      // Act
      const response = await app
        .request()
        .delete(providerKeyPath(workspaceId))
        .set('Authorization', ada);

      // Assert
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.code).toBe('PROVIDER_KEY_NOT_FOUND');
    });
  });
});
