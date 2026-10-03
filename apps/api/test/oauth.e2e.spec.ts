import { createHash, randomBytes } from 'node:crypto';

import { HttpStatus } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceModule } from '@intentra/workspace';

import { signUp } from './support/sign-up.js';
import { setOpenWorkspaceCreation } from './support/workspace-creation.js';

const PUBLIC_URL = 'https://intentra.example.com';
const REDIRECT_URI = 'https://chatgpt.com/connector_platform_oauth_redirect';
const SIGN_IN_PATH = '/api/iam/auth/sign-in';
const WORKSPACES_PATH = '/api/workspaces';
const REGISTER_PATH = '/api/oauth/register';
const AUTHORIZATIONS_PATH = '/api/oauth/authorizations';
const TOKEN_PATH = '/api/oauth/token';
const MCP_PATH = '/api/mcp';

function pkce(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');

  return { verifier, challenge };
}

describe('OAuth for MCP clients', () => {
  let app: TestingApp;
  let authorization: string;
  let workspaceId: string;

  const register = (redirectUris = [REDIRECT_URI]) =>
    app
      .request()
      .post(REGISTER_PATH)
      .send({ client_name: 'ChatGPT', redirect_uris: redirectUris });

  /** Registers ChatGPT, has Ada approve it, and returns the code it receives. */
  async function approve(challenge: string): Promise<{
    clientId: string;
    code: string;
    redirectUrl: URL;
  }> {
    const registered = await register().expect(HttpStatus.CREATED);
    const clientId: string = registered.body.client_id;
    const approved = await app
      .request()
      .post(AUTHORIZATIONS_PATH)
      .set('Authorization', authorization)
      .send({
        clientId,
        redirectUri: REDIRECT_URI,
        codeChallenge: challenge,
        codeChallengeMethod: 'S256',
        state: 'xyz',
        workspaceId,
        level: 'viewer',
        lifetimeDays: 30,
      })
      .expect(HttpStatus.CREATED);
    const redirectUrl = new URL(approved.body.redirectUrl);

    return {
      clientId,
      code: redirectUrl.searchParams.get('code') ?? '',
      redirectUrl,
    };
  }

  const exchange = (body: Record<string, string>) =>
    app.request().post(TOKEN_PATH).type('form').send(body);

  beforeAll(async () => {
    app = await TestingApp.create({
      imports: [
        GatewayModule.register({
          mcp: { allowedHosts: ['127.0.0.1'] },
          oauth: { publicUrl: PUBLIC_URL },
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
    const credentials = {
      email: 'ada@example.com',
      password: 'correct-horse-battery-staple',
    };
    await signUp(app, credentials);
    const session = await app
      .request()
      .post(SIGN_IN_PATH)
      .send(credentials)
      .expect(HttpStatus.OK);
    authorization = `Bearer ${session.body.accessToken}`;
    await setOpenWorkspaceCreation(app, true);
    const workspace = await app
      .request()
      .post(WORKSPACES_PATH)
      .set('Authorization', authorization)
      .send({ name: 'Acme', slug: 'acme' })
      .expect(HttpStatus.CREATED);
    workspaceId = workspace.body.id;
  });

  afterAll(async () => {
    await app?.clearDatabase();
    await app?.close();
  });

  it('points an unauthenticated MCP client to the resource metadata', async () => {
    // Act
    const response = await app
      .request()
      .post(MCP_PATH)
      .set('Accept', 'application/json, text/event-stream')
      .send({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });

    // Assert
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.headers['www-authenticate']).toBe(
      `Bearer resource_metadata="${PUBLIC_URL}/.well-known/oauth-protected-resource/api/mcp"`,
    );
  });

  it("points a client of a Workspace's own address to that address's metadata", async () => {
    // Act
    const response = await app
      .request()
      .post(`${MCP_PATH}/acme`)
      .set('Accept', 'application/json, text/event-stream')
      .send({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });
    const resource = await app
      .request()
      .get('/.well-known/oauth-protected-resource/api/mcp/acme');

    // Assert
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.headers['www-authenticate']).toBe(
      `Bearer resource_metadata="${PUBLIC_URL}/.well-known/oauth-protected-resource/api/mcp/acme"`,
    );
    expect(resource.status).toBe(HttpStatus.OK);
    expect(resource.body).toMatchObject({
      resource: `${PUBLIC_URL}/api/mcp/acme`,
      authorization_servers: [PUBLIC_URL],
    });
  });

  it('describes the protected resource and the authorization server', async () => {
    // Act
    const resource = await app
      .request()
      .get('/.well-known/oauth-protected-resource/api/mcp')
      .expect(HttpStatus.OK);
    const server = await app
      .request()
      .get('/.well-known/oauth-authorization-server')
      .expect(HttpStatus.OK);

    // Assert
    expect(resource.body).toMatchObject({
      resource: `${PUBLIC_URL}/api/mcp`,
      authorization_servers: [PUBLIC_URL],
    });
    expect(server.body).toMatchObject({
      issuer: PUBLIC_URL,
      authorization_endpoint: `${PUBLIC_URL}/oauth/authorize`,
      token_endpoint: `${PUBLIC_URL}${TOKEN_PATH}`,
      registration_endpoint: `${PUBLIC_URL}${REGISTER_PATH}`,
      code_challenge_methods_supported: ['S256'],
    });
  });

  it('refuses to register a redirect URI over plain HTTP to another host', async () => {
    // Act
    const response = await register(['http://attacker.example.com/callback']);

    // Assert
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.error).toBe('invalid_redirect_uri');
  });

  it('shows the consent page who is asking', async () => {
    // Arrange
    const registered = await register().expect(HttpStatus.CREATED);

    // Act
    const response = await app
      .request()
      .get('/api/oauth/client')
      .query({ clientId: registered.body.client_id, redirectUri: REDIRECT_URI })
      .expect(HttpStatus.OK);

    // Assert
    expect(response.body).toEqual({
      name: 'ChatGPT',
      redirectHost: 'chatgpt.com',
    });
  });

  it('refuses a redirect URI the client did not register', async () => {
    // Arrange
    const registered = await register().expect(HttpStatus.CREATED);

    // Act
    const response = await app.request().get('/api/oauth/client').query({
      clientId: registered.body.client_id,
      redirectUri: 'https://attacker.example.com/callback',
    });

    // Assert
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.code).toBe('INVALID_OAUTH_REQUEST');
  });

  it('gives the approved client a Personal Access Token that works over MCP', async () => {
    // Arrange
    const { verifier, challenge } = pkce();
    const { clientId, code, redirectUrl } = await approve(challenge);

    // Act
    const token = await exchange({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: clientId,
      code_verifier: verifier,
    }).expect(HttpStatus.OK);
    const mcp = await app
      .request()
      .post(MCP_PATH)
      .set('Accept', 'application/json, text/event-stream')
      .set('Authorization', `Bearer ${token.body.access_token}`)
      .send({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });
    const tokens = await app
      .request()
      .get(`${WORKSPACES_PATH}/${workspaceId}/personal-access-tokens`)
      .set('Authorization', authorization)
      .expect(HttpStatus.OK);

    // Assert
    expect(redirectUrl.searchParams.get('state')).toBe('xyz');
    expect(redirectUrl.searchParams.get('iss')).toBe(PUBLIC_URL);
    expect(token.body.token_type).toBe('Bearer');
    expect(token.body.expires_in).toBeGreaterThan(29 * 24 * 3600);
    expect(mcp.status).toBe(HttpStatus.OK);
    expect(tokens.body).toContainEqual(
      expect.objectContaining({ name: 'ChatGPT', level: 'viewer' }),
    );
  });

  it('refuses a code with the wrong PKCE verifier', async () => {
    // Arrange
    const { challenge } = pkce();
    const { clientId, code } = await approve(challenge);

    // Act
    const response = await exchange({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: clientId,
      code_verifier: pkce().verifier,
    });

    // Assert
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.error).toBe('invalid_grant');
  });

  it('refuses a code the second time', async () => {
    // Arrange
    const { verifier, challenge } = pkce();
    const { clientId, code } = await approve(challenge);
    const body = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: clientId,
      code_verifier: verifier,
    };
    await exchange(body).expect(HttpStatus.OK);

    // Act
    const response = await exchange(body);

    // Assert
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.error).toBe('invalid_grant');
  });

  it('refuses the refresh token grant', async () => {
    // Act
    const response = await exchange({
      grant_type: 'refresh_token',
      refresh_token: 'anything',
    });

    // Assert
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.error).toBe('unsupported_grant_type');
  });

  it('refuses approval without a session', async () => {
    // Arrange
    const registered = await register().expect(HttpStatus.CREATED);

    // Act
    const response = await app.request().post(AUTHORIZATIONS_PATH).send({
      clientId: registered.body.client_id,
      redirectUri: REDIRECT_URI,
      codeChallenge: pkce().challenge,
      codeChallengeMethod: 'S256',
      workspaceId,
      level: 'viewer',
    });

    // Assert
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
