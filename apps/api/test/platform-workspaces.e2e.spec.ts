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

import { signUp } from './support/sign-up.js';

const SIGN_IN_PATH = '/api/iam/auth/sign-in';
const WORKSPACES_PATH = '/api/workspaces';
const PLATFORM_WORKSPACES_PATH = '/api/platform/workspaces';
const PLATFORM_ACCOUNTS_PATH = '/api/platform/accounts';
const MCP_PATH = '/api/mcp';

const PASSWORD = 'correct-horse-battery-staple';

describe('Workspaces and Accounts for a Platform Admin', () => {
  let app: TestingApp;
  /** The Platform Admin's; an access token keeps working after its Account is cleared away. */
  let admin: string;

  const adminCredentials = {
    email: 'admin@example.com',
    name: 'Grace Hopper',
    password: PASSWORD,
  };

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
              platformAdmin: adminCredentials,
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
    const signedIn = await app
      .request()
      .post(SIGN_IN_PATH)
      .send(adminCredentials)
      .expect(HttpStatus.OK);
    admin = `Bearer ${signedIn.body.accessToken}`;
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await app.clearDatabase();
  });

  afterAll(() => app?.close());

  function signIn(email: string) {
    return app.request().post(SIGN_IN_PATH).send({ email, password: PASSWORD });
  }

  async function signUpAndIn(email: string): Promise<string> {
    await signUp(app, { email, password: PASSWORD });
    const response = await signIn(email).expect(HttpStatus.OK);

    return `Bearer ${response.body.accessToken}`;
  }

  type Setup = {
    readonly ada: string;
    readonly bob: string;
    readonly workspaceId: string;
    /** Bob's Personal Access Token. */
    readonly bobToken: { readonly id: string; readonly secret: string };
  };

  /** Ada owns Acme with one Project and a Provider Key; Bob joined it and has a Personal Access Token. */
  async function setUp(): Promise<Setup> {
    const ada = await signUpAndIn('ada@example.com');
    const bob = await signUpAndIn('bob@example.com');
    const workspace = await app
      .request()
      .post(WORKSPACES_PATH)
      .set('Authorization', ada)
      .send({ name: 'Acme', slug: 'acme' })
      .expect(HttpStatus.CREATED);
    const workspaceId: string = workspace.body.id;
    const invitation = await app
      .request()
      .post(`${WORKSPACES_PATH}/${workspaceId}/invitations`)
      .set('Authorization', ada)
      .send({ email: 'bob@example.com' })
      .expect(HttpStatus.CREATED);
    await app
      .request()
      .post(`/api/invitations/${invitation.body.id}/accept`)
      .set('Authorization', bob)
      .expect(HttpStatus.OK);
    await app
      .request()
      .post(`${WORKSPACES_PATH}/${workspaceId}/projects`)
      .set('Authorization', ada)
      .send({ name: 'Billing', slug: 'billing' })
      .expect(HttpStatus.CREATED);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: HttpStatus.OK }),
    );
    await app
      .request()
      .put(`${WORKSPACES_PATH}/${workspaceId}/provider-key`)
      .set('Authorization', ada)
      .send({ key: 'sk-or-v1-0123456789abcdef' })
      .expect(HttpStatus.OK);
    const token = await app
      .request()
      .post(`${WORKSPACES_PATH}/${workspaceId}/personal-access-tokens`)
      .set('Authorization', bob)
      .send({ name: 'Claude Code', level: 'viewer', lifetimeDays: 30 })
      .expect(HttpStatus.CREATED);

    return {
      ada,
      bob,
      workspaceId,
      bobToken: { id: token.body.token.id, secret: token.body.secret },
    };
  }

  function callMcp(secret: string) {
    return app
      .request()
      .post(MCP_PATH)
      .set('Accept', 'application/json, text/event-stream')
      .set('Authorization', `Bearer ${secret}`)
      .send({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });
  }

  function suspend(workspaceId: string) {
    return app
      .request()
      .post(`${PLATFORM_WORKSPACES_PATH}/${workspaceId}/suspend`)
      .set('Authorization', admin);
  }

  async function accountId(email: string): Promise<string> {
    const accounts = await app
      .request()
      .get(PLATFORM_ACCOUNTS_PATH)
      .set('Authorization', admin)
      .expect(HttpStatus.OK);

    return accounts.body.find(
      (account: { email: string }) => account.email === email,
    ).id;
  }

  describe('access', () => {
    it('refuses anyone but a Platform Admin', async () => {
      // Arrange
      const { ada } = await setUp();

      // Act
      const [workspaces, accounts] = await Promise.all([
        app.request().get(PLATFORM_WORKSPACES_PATH).set('Authorization', ada),
        app.request().get(PLATFORM_ACCOUNTS_PATH).set('Authorization', ada),
      ]);

      // Assert
      expect(workspaces.status).toBe(HttpStatus.FORBIDDEN);
      expect(accounts.status).toBe(HttpStatus.FORBIDDEN);
      expect(accounts.body.code).toBe('NOT_PLATFORM_ADMIN');
    });
  });

  describe('Workspaces', () => {
    it('shows each Workspace from outside', async () => {
      // Arrange
      const { workspaceId } = await setUp();

      // Act
      const response = await app
        .request()
        .get(PLATFORM_WORKSPACES_PATH)
        .set('Authorization', admin);

      // Assert
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual([
        {
          id: workspaceId,
          name: 'Acme',
          slug: 'acme',
          suspended: false,
          owners: ['ada@example.com'],
          membersCount: 2,
          projectsCount: 1,
          hasProviderKey: true,
        },
      ]);
    });

    it('lets nothing in a suspended Workspace change, while everything can be read', async () => {
      // Arrange
      const { ada, workspaceId } = await setUp();

      // Act
      await suspend(workspaceId).expect(HttpStatus.NO_CONTENT);

      // Assert
      const creating = await app
        .request()
        .post(`${WORKSPACES_PATH}/${workspaceId}/projects`)
        .set('Authorization', ada)
        .send({ name: 'Payroll', slug: 'payroll' });
      expect(creating.status).toBe(HttpStatus.FORBIDDEN);
      expect(creating.body.code).toBe('WORKSPACE_SUSPENDED');
      await app
        .request()
        .get(`${WORKSPACES_PATH}/${workspaceId}/projects`)
        .set('Authorization', ada)
        .expect(HttpStatus.OK);
      const access = await app
        .request()
        .get(`${WORKSPACES_PATH}/${workspaceId}/access`)
        .set('Authorization', ada)
        .expect(HttpStatus.OK);
      expect(access.body.suspended).toBe(true);
    });

    it('keeps external agents out of a suspended Workspace', async () => {
      // Arrange
      const { workspaceId, bobToken } = await setUp();
      await callMcp(bobToken.secret).expect(HttpStatus.OK);

      // Act
      await suspend(workspaceId).expect(HttpStatus.NO_CONTENT);

      // Assert
      const response = await callMcp(bobToken.secret);
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(response.body.code).toBe('WORKSPACE_SUSPENDED');
    });

    it('still lets a Member revoke a token and leave a suspended Workspace', async () => {
      // Arrange
      const { bob, workspaceId, bobToken } = await setUp();
      await suspend(workspaceId).expect(HttpStatus.NO_CONTENT);

      // Act
      const revoking = await app
        .request()
        .delete(
          `${WORKSPACES_PATH}/${workspaceId}/personal-access-tokens/${bobToken.id}`,
        )
        .set('Authorization', bob);
      const leaving = await app
        .request()
        .post(`${WORKSPACES_PATH}/${workspaceId}/leave`)
        .set('Authorization', bob);

      // Assert
      expect(revoking.status).toBe(HttpStatus.NO_CONTENT);
      expect(leaving.status).toBe(HttpStatus.NO_CONTENT);
    });

    it('lets changes in again once resumed', async () => {
      // Arrange
      const { ada, workspaceId } = await setUp();
      await suspend(workspaceId).expect(HttpStatus.NO_CONTENT);

      // Act
      await app
        .request()
        .post(`${PLATFORM_WORKSPACES_PATH}/${workspaceId}/resume`)
        .set('Authorization', admin)
        .expect(HttpStatus.NO_CONTENT);

      // Assert
      await app
        .request()
        .post(`${WORKSPACES_PATH}/${workspaceId}/projects`)
        .set('Authorization', ada)
        .send({ name: 'Payroll', slug: 'payroll' })
        .expect(HttpStatus.CREATED);
    });

    it('deletes a Workspace only once its slug is typed', async () => {
      // Arrange
      const { ada, workspaceId } = await setUp();
      const path = `${PLATFORM_WORKSPACES_PATH}/${workspaceId}`;
      const mistyped = await app
        .request()
        .delete(path)
        .set('Authorization', admin)
        .send({ slug: 'acm' });

      // Act
      const response = await app
        .request()
        .delete(path)
        .set('Authorization', admin)
        .send({ slug: 'acme' });

      // Assert
      expect(mistyped.body.code).toBe('WORKSPACE_SLUG_MISMATCH');
      expect(response.status).toBe(HttpStatus.NO_CONTENT);
      await app
        .request()
        .get(`${WORKSPACES_PATH}/${workspaceId}/projects`)
        .set('Authorization', ada)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Accounts', () => {
    it('blocks an Account: no signing in, and its tokens revoked for good', async () => {
      // Arrange
      const { bobToken } = await setUp();
      const bobId = await accountId('bob@example.com');

      // Act
      await app
        .request()
        .post(`${PLATFORM_ACCOUNTS_PATH}/${bobId}/block`)
        .set('Authorization', admin)
        .expect(HttpStatus.NO_CONTENT);

      // Assert
      const signingIn = await signIn('bob@example.com');
      expect(signingIn.status).toBe(HttpStatus.FORBIDDEN);
      expect(signingIn.body.code).toBe('ACCOUNT_BLOCKED');
      await callMcp(bobToken.secret).expect(HttpStatus.UNAUTHORIZED);
      await app
        .request()
        .post(`${PLATFORM_ACCOUNTS_PATH}/${bobId}/unblock`)
        .set('Authorization', admin)
        .expect(HttpStatus.NO_CONTENT);
      await signIn('bob@example.com').expect(HttpStatus.OK);
      await callMcp(bobToken.secret).expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
