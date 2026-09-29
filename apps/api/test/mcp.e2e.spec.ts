import { HttpStatus } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AgentsModule } from '@intentra/agents';
import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceModule } from '@intentra/workspace';

const SIGN_UP_PATH = '/api/iam/auth/sign-up';
const SIGN_IN_PATH = '/api/iam/auth/sign-in';
const WORKSPACES_PATH = '/api/workspaces';
const MCP_PATH = '/api/mcp';

describe('POST /api/mcp', () => {
  let app: TestingApp;
  let secret: string;

  const call = (method: string, params: object, token = secret) =>
    app
      .request()
      .post(MCP_PATH)
      .set('Accept', 'application/json, text/event-stream')
      .set('Authorization', `Bearer ${token}`)
      .send({ jsonrpc: '2.0', id: 1, method, params });

  /** Ada signs up, creates a Workspace and a Personal Access Token for her agent. */
  async function createPersonalAccessToken(): Promise<string> {
    const credentials = {
      email: 'ada@example.com',
      password: 'correct-horse-battery-staple',
    };
    await app.request().post(SIGN_UP_PATH).send(credentials);
    const session = await app
      .request()
      .post(SIGN_IN_PATH)
      .send(credentials)
      .expect(HttpStatus.OK);
    const authorization = `Bearer ${session.body.accessToken}`;
    const workspace = await app
      .request()
      .post(WORKSPACES_PATH)
      .set('Authorization', authorization)
      .send({ name: 'Acme', slug: 'acme' })
      .expect(HttpStatus.CREATED);
    const token = await app
      .request()
      .post(`${WORKSPACES_PATH}/${workspace.body.id}/personal-access-tokens`)
      .set('Authorization', authorization)
      .send({ name: 'Claude Code', level: 'contributor' })
      .expect(HttpStatus.CREATED);

    return token.body.secret;
  }

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
            AgentsModule.register({}),
          ],
        }),
      ],
    });
    secret = await createPersonalAccessToken();
  });

  afterAll(async () => {
    await app?.clearDatabase();
    await app?.close();
  });

  it('initializes an MCP session', async () => {
    // Act
    const response = await call('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'e2e', version: '1.0.0' },
    });

    // Assert
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.text).toContain('"name":"intentra"');
  });

  it('calls the echo tool', async () => {
    // Act
    const response = await call('tools/call', {
      name: 'echo',
      arguments: { message: 'hello' },
    });

    // Assert
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.text).toContain('"structuredContent":{"message":"hello"}');
  });

  it('rejects a request without a Personal Access Token', async () => {
    // Act
    const response = await app
      .request()
      .post(MCP_PATH)
      .set('Accept', 'application/json, text/event-stream')
      .send({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });

    // Assert
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('rejects an unknown Personal Access Token', async () => {
    // Act
    const response = await call('tools/list', {}, 'intr_unknown');

    // Assert
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.code).toBe('INVALID_PERSONAL_ACCESS_TOKEN');
  });
});
