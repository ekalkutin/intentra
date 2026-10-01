import { HttpStatus } from '@nestjs/common';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceModule } from '@intentra/workspace';

import { signUp } from './support/sign-up.js';

const SIGN_IN_PATH = '/api/iam/auth/sign-in';
const WORKSPACES_PATH = '/api/workspaces';

const MCP_PATH = '/api/mcp';

function tokensPath(workspaceId: string): string {
  return `${WORKSPACES_PATH}/${workspaceId}/personal-access-tokens`;
}

describe('/api/workspaces/:workspaceId/personal-access-tokens', () => {
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
            WorkspaceModule.register({}),
          ],
        }),
      ],
    });
  });

  afterEach(() => app.clearDatabase());

  afterAll(() => app?.close());

  async function signIn(email: string): Promise<string> {
    const credentials = { email, password: 'correct-horse-battery-staple' };
    await signUp(app, credentials);
    const response = await app
      .request()
      .post(SIGN_IN_PATH)
      .send(credentials)
      .expect(HttpStatus.OK);

    return `Bearer ${response.body.accessToken}`;
  }

  async function createWorkspace(authorization: string): Promise<string> {
    const response = await app
      .request()
      .post(WORKSPACES_PATH)
      .set('Authorization', authorization)
      .send({ name: 'Acme', slug: 'acme' })
      .expect(HttpStatus.CREATED);

    return response.body.id;
  }

  async function join(
    owner: string,
    workspaceId: string,
    email: string,
  ): Promise<string> {
    const member = await signIn(email);
    const invitation = await app
      .request()
      .post(`${WORKSPACES_PATH}/${workspaceId}/invitations`)
      .set('Authorization', owner)
      .send({ email })
      .expect(HttpStatus.CREATED);
    await app
      .request()
      .post(`/api/invitations/${invitation.body.id}/accept`)
      .set('Authorization', member)
      .expect(HttpStatus.OK);

    return member;
  }

  async function createToken(
    authorization: string,
    workspaceId: string,
  ): Promise<{ id: string; secret: string }> {
    const response = await app
      .request()
      .post(tokensPath(workspaceId))
      .set('Authorization', authorization)
      .send({ name: 'Claude Code', level: 'viewer', lifetimeDays: 30 })
      .expect(HttpStatus.CREATED);

    return { id: response.body.token.id, secret: response.body.secret };
  }

  function callMcp(secret: string) {
    return app
      .request()
      .post(MCP_PATH)
      .set('Accept', 'application/json, text/event-stream')
      .set('Authorization', `Bearer ${secret}`)
      .send({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });
  }

  it('creates a token and shows its secret once', async () => {
    // Arrange
    const ada = await signIn('ada@example.com');
    const workspaceId = await createWorkspace(ada);

    // Act
    const response = app
      .request()
      .post(tokensPath(workspaceId))
      .set('Authorization', ada)
      .send({ name: 'Claude Code', level: 'contributor' });

    // Assert
    await response.expect(HttpStatus.CREATED).expect(res => {
      expect(res.body.secret).toMatch(/^intr_/);
      expect(res.body.token).toMatchObject({
        name: 'Claude Code',
        level: 'contributor',
        memberEmail: 'ada@example.com',
        lastUsedAt: null,
      });
      expect(res.body.token.expiresAt).not.toBeNull();
    });
  });

  it('rejects a lifetime that is not offered', async () => {
    // Arrange
    const ada = await signIn('ada@example.com');
    const workspaceId = await createWorkspace(ada);

    // Act
    const response = app
      .request()
      .post(tokensPath(workspaceId))
      .set('Authorization', ada)
      .send({ name: 'Claude Code', level: 'viewer', lifetimeDays: 7 });

    // Assert
    await response.expect(HttpStatus.BAD_REQUEST);
  });

  it("lets an Owner see and revoke a Member's token", async () => {
    // Arrange
    const ada = await signIn('ada@example.com');
    const workspaceId = await createWorkspace(ada);
    const bob = await join(ada, workspaceId, 'bob@example.com');
    const token = await createToken(bob, workspaceId);
    const listed = await app
      .request()
      .get(tokensPath(workspaceId))
      .set('Authorization', ada)
      .expect(HttpStatus.OK);

    // Act
    const response = app
      .request()
      .delete(`${tokensPath(workspaceId)}/${token.id}`)
      .set('Authorization', ada);

    // Assert
    expect(listed.body.map((t: { id: string }) => t.id)).toEqual([token.id]);
    await response.expect(HttpStatus.NO_CONTENT);
    await callMcp(token.secret).expect(HttpStatus.UNAUTHORIZED);
  });

  it('stops a token working once its Member leaves', async () => {
    // Arrange
    const ada = await signIn('ada@example.com');
    const workspaceId = await createWorkspace(ada);
    const bob = await join(ada, workspaceId, 'bob@example.com');
    const token = await createToken(bob, workspaceId);
    await callMcp(token.secret).expect(HttpStatus.OK);

    // Act
    await app
      .request()
      .post(`${WORKSPACES_PATH}/${workspaceId}/leave`)
      .set('Authorization', bob)
      .expect(HttpStatus.NO_CONTENT);

    // Assert
    await callMcp(token.secret).expect(HttpStatus.UNAUTHORIZED);
  });
});
