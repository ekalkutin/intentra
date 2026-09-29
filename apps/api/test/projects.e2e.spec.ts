import { HttpStatus } from '@nestjs/common';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { AgentsModule } from '@intentra/agents';
import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceModule } from '@intentra/workspace';

const SIGN_UP_PATH = '/api/iam/auth/sign-up';
const SIGN_IN_PATH = '/api/iam/auth/sign-in';
const WORKSPACES_PATH = '/api/workspaces';

function projectsPath(workspaceId: string): string {
  return `${WORKSPACES_PATH}/${workspaceId}/projects`;
}

describe('/api/workspaces/:workspaceId/projects', () => {
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
            AgentsModule.register({}),
          ],
        }),
      ],
    });
  });

  afterEach(() => app.clearDatabase());

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

  async function createWorkspace(authorization: string): Promise<string> {
    const response = await app
      .request()
      .post(WORKSPACES_PATH)
      .set('Authorization', authorization)
      .send({ name: 'Acme', slug: 'acme' })
      .expect(HttpStatus.CREATED);

    return response.body.id;
  }

  describe('POST', () => {
    it('creates a Project', async () => {
      // Arrange
      const owner = await signIn('ada@example.com');
      const workspaceId = await createWorkspace(owner);

      // Act
      const response = app
        .request()
        .post(projectsPath(workspaceId))
        .set('Authorization', owner)
        .send({ name: 'Billing', slug: 'billing' });

      // Assert
      await response.expect(HttpStatus.CREATED).expect(res =>
        expect(res.body).toEqual({
          id: expect.any(String),
          name: 'Billing',
          slug: 'billing',
        }),
      );
    });

    it('rejects a taken slug', async () => {
      // Arrange
      const owner = await signIn('ada@example.com');
      const workspaceId = await createWorkspace(owner);
      const body = { name: 'Billing', slug: 'billing' };
      await app
        .request()
        .post(projectsPath(workspaceId))
        .set('Authorization', owner)
        .send(body);

      // Act
      const response = app
        .request()
        .post(projectsPath(workspaceId))
        .set('Authorization', owner)
        .send(body);

      // Assert
      await response
        .expect(HttpStatus.CONFLICT)
        .expect(res => expect(res.body.code).toBe('PROJECT_SLUG_TAKEN'));
    });

    it('hides the Workspace from an outsider', async () => {
      // Arrange
      const workspaceId = await createWorkspace(
        await signIn('ada@example.com'),
      );
      const outsider = await signIn('bob@example.com');

      // Act
      const response = app
        .request()
        .post(projectsPath(workspaceId))
        .set('Authorization', outsider)
        .send({ name: 'Billing', slug: 'billing' });

      // Assert
      await response
        .expect(HttpStatus.NOT_FOUND)
        .expect(res => expect(res.body.code).toBe('WORKSPACE_NOT_FOUND'));
    });

    it('rejects an invalid slug', async () => {
      // Arrange
      const owner = await signIn('ada@example.com');
      const workspaceId = await createWorkspace(owner);

      // Act
      const response = app
        .request()
        .post(projectsPath(workspaceId))
        .set('Authorization', owner)
        .send({ name: 'Billing', slug: 'Billing Service' });

      // Assert
      await response
        .expect(HttpStatus.BAD_REQUEST)
        .expect(res => expect(res.body.code).toBe('INVALID_PROJECT_SLUG'));
    });
  });

  describe('GET', () => {
    it('lists the Projects of the Workspace', async () => {
      // Arrange
      const owner = await signIn('ada@example.com');
      const workspaceId = await createWorkspace(owner);
      await app
        .request()
        .post(projectsPath(workspaceId))
        .set('Authorization', owner)
        .send({ name: 'Billing', slug: 'billing' });

      // Act
      const response = app
        .request()
        .get(projectsPath(workspaceId))
        .set('Authorization', owner);

      // Assert
      await response
        .expect(HttpStatus.OK)
        .expect(res =>
          expect(res.body).toEqual([
            { id: expect.any(String), name: 'Billing', slug: 'billing' },
          ]),
        );
    });

    it('rejects a Workspace id that is not a UUID', async () => {
      // Arrange
      const owner = await signIn('ada@example.com');

      // Act
      const response = app
        .request()
        .get(projectsPath('not-a-uuid'))
        .set('Authorization', owner);

      // Assert
      await response
        .expect(HttpStatus.BAD_REQUEST)
        .expect(res => expect(res.body.code).toBe('INVALID_ENTITY_ID'));
    });
  });

  describe('DELETE /:projectId', () => {
    it('deletes the Project once its slug is typed', async () => {
      // Arrange
      const owner = await signIn('ada@example.com');
      const workspaceId = await createWorkspace(owner);
      const created = await app
        .request()
        .post(projectsPath(workspaceId))
        .set('Authorization', owner)
        .send({ name: 'Billing', slug: 'billing' })
        .expect(HttpStatus.CREATED);

      // Act
      const response = app
        .request()
        .delete(`${projectsPath(workspaceId)}/${created.body.id}`)
        .set('Authorization', owner)
        .send({ slug: 'billing' });

      // Assert
      await response.expect(HttpStatus.NO_CONTENT);
      await app
        .request()
        .get(projectsPath(workspaceId))
        .set('Authorization', owner)
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toEqual([]));
    });
  });
});
