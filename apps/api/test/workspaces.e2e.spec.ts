import { HttpStatus } from '@nestjs/common';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceModule } from '@intentra/workspace';

import { signUp } from './support/sign-up.js';

const SIGN_IN_PATH = '/api/iam/auth/sign-in';
const WORKSPACES_PATH = '/api/workspaces';

describe('/api/workspaces', () => {
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

  describe('POST', () => {
    it('creates a Workspace', async () => {
      // Arrange
      const authorization = await signIn('ada@example.com');

      // Act
      const response = app
        .request()
        .post(WORKSPACES_PATH)
        .set('Authorization', authorization)
        .send({ name: 'Acme Corp', slug: 'acme-corp' });

      // Assert
      await response.expect(HttpStatus.CREATED).expect(res =>
        expect(res.body).toEqual({
          id: expect.any(String),
          name: 'Acme Corp',
          slug: 'acme-corp',
          suspended: false,
        }),
      );
    });

    it('rejects an invalid slug', async () => {
      // Arrange
      const authorization = await signIn('ada@example.com');

      // Act
      const response = app
        .request()
        .post(WORKSPACES_PATH)
        .set('Authorization', authorization)
        .send({ name: 'Acme Corp', slug: 'Acme Corp' });

      // Assert
      await response
        .expect(HttpStatus.BAD_REQUEST)
        .expect(res => expect(res.body.code).toBe('INVALID_WORKSPACE_SLUG'));
    });

    it('rejects a taken slug', async () => {
      // Arrange
      const ada = await signIn('ada@example.com');
      const bob = await signIn('bob@example.com');
      const body = { name: 'Acme', slug: 'acme' };
      await app
        .request()
        .post(WORKSPACES_PATH)
        .set('Authorization', ada)
        .send(body);

      // Act
      const response = app
        .request()
        .post(WORKSPACES_PATH)
        .set('Authorization', bob)
        .send(body);

      // Assert
      await response
        .expect(HttpStatus.CONFLICT)
        .expect(res => expect(res.body.code).toBe('WORKSPACE_SLUG_TAKEN'));
    });

    it('rejects a request without a token', async () => {
      // Act
      const response = app
        .request()
        .post(WORKSPACES_PATH)
        .send({ name: 'Acme', slug: 'acme' });

      // Assert
      await response.expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET', () => {
    it('lists only the Actor’s Workspaces', async () => {
      // Arrange
      const ada = await signIn('ada@example.com');
      const bob = await signIn('bob@example.com');
      await app
        .request()
        .post(WORKSPACES_PATH)
        .set('Authorization', ada)
        .send({ name: 'Acme', slug: 'acme' });
      await app
        .request()
        .post(WORKSPACES_PATH)
        .set('Authorization', bob)
        .send({ name: 'Globex', slug: 'globex' });

      // Act
      const response = app
        .request()
        .get(WORKSPACES_PATH)
        .set('Authorization', ada);

      // Assert
      await response.expect(HttpStatus.OK).expect(res =>
        expect(res.body).toEqual([
          {
            id: expect.any(String),
            name: 'Acme',
            slug: 'acme',
            suspended: false,
          },
        ]),
      );
    });
  });

  describe('DELETE /:workspaceId', () => {
    async function createWorkspace(authorization: string): Promise<string> {
      const response = await app
        .request()
        .post(WORKSPACES_PATH)
        .set('Authorization', authorization)
        .send({ name: 'Acme', slug: 'acme' })
        .expect(HttpStatus.CREATED);

      return response.body.id;
    }

    it('deletes the Workspace once its slug is typed', async () => {
      // Arrange
      const owner = await signIn('ada@example.com');
      const workspaceId = await createWorkspace(owner);

      // Act
      const response = app
        .request()
        .delete(`${WORKSPACES_PATH}/${workspaceId}`)
        .set('Authorization', owner)
        .send({ slug: 'acme' });

      // Assert
      await response.expect(HttpStatus.NO_CONTENT);
      await app
        .request()
        .get(WORKSPACES_PATH)
        .set('Authorization', owner)
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toEqual([]));
    });

    it('rejects a slug that does not match', async () => {
      // Arrange
      const owner = await signIn('ada@example.com');
      const workspaceId = await createWorkspace(owner);

      // Act
      const response = app
        .request()
        .delete(`${WORKSPACES_PATH}/${workspaceId}`)
        .set('Authorization', owner)
        .send({ slug: 'acm' });

      // Assert
      await response
        .expect(HttpStatus.BAD_REQUEST)
        .expect(res => expect(res.body.code).toBe('WORKSPACE_SLUG_MISMATCH'));
    });
  });
});
