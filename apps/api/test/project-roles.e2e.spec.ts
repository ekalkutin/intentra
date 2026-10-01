import { HttpStatus } from '@nestjs/common';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceModule } from '@intentra/workspace';

import { signUp } from './support/sign-up.js';
import { setOpenWorkspaceCreation } from './support/workspace-creation.js';

const SIGN_IN_PATH = '/api/iam/auth/sign-in';
const WORKSPACES_PATH = '/api/workspaces';

function rolesPath(workspaceId: string, projectId: string): string {
  return `${WORKSPACES_PATH}/${workspaceId}/projects/${projectId}/roles`;
}

describe('/api/workspaces/:workspaceId/projects/:projectId/roles', () => {
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

  beforeEach(() => setOpenWorkspaceCreation(app, true));

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

  /** Ada owns the Workspace and the Project; Bob joined by Invitation. */
  async function setUp(): Promise<{
    ada: string;
    bob: string;
    workspaceId: string;
    projectId: string;
    bobId: string;
  }> {
    const ada = await signIn('ada@example.com');
    const bob = await signIn('bob@example.com');
    const workspaceId = await createWorkspace(ada);
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
    const project = await app
      .request()
      .post(`${WORKSPACES_PATH}/${workspaceId}/projects`)
      .set('Authorization', ada)
      .send({ name: 'Billing', slug: 'billing' })
      .expect(HttpStatus.CREATED);
    const roles = await app
      .request()
      .get(rolesPath(workspaceId, project.body.id))
      .set('Authorization', ada)
      .expect(HttpStatus.OK);
    const bobRole = roles.body.find(
      (r: { email: string }) => r.email === 'bob@example.com',
    );

    return {
      ada,
      bob,
      workspaceId,
      projectId: project.body.id,
      bobId: bobRole.memberId,
    };
  }

  it('lists the Owner as Maintainer and everyone else as Viewer', async () => {
    // Arrange
    const { bob, workspaceId, projectId } = await setUp();

    // Act
    const response = app
      .request()
      .get(rolesPath(workspaceId, projectId))
      .set('Authorization', bob);

    // Assert
    await response.expect(HttpStatus.OK).expect(res =>
      expect(res.body).toEqual([
        {
          memberId: expect.any(String),
          email: 'ada@example.com',
          name: 'ada',
          role: 'maintainer',
        },
        {
          memberId: expect.any(String),
          email: 'bob@example.com',
          name: 'bob',
          role: 'viewer',
        },
      ]),
    );
  });

  it('lets the Owner make a Member a Contributor', async () => {
    // Arrange
    const { ada, workspaceId, projectId, bobId } = await setUp();

    // Act
    const response = app
      .request()
      .put(`${rolesPath(workspaceId, projectId)}/${bobId}`)
      .set('Authorization', ada)
      .send({ role: 'contributor' });

    // Assert
    await response.expect(HttpStatus.OK).expect(res =>
      expect(res.body).toEqual({
        memberId: bobId,
        email: 'bob@example.com',
        name: 'bob',
        role: 'contributor',
      }),
    );
  });

  it('rejects a Viewer changing Project Roles', async () => {
    // Arrange
    const { bob, workspaceId, projectId, bobId } = await setUp();

    // Act
    const response = app
      .request()
      .put(`${rolesPath(workspaceId, projectId)}/${bobId}`)
      .set('Authorization', bob)
      .send({ role: 'maintainer' });

    // Assert
    await response
      .expect(HttpStatus.FORBIDDEN)
      .expect(res =>
        expect(res.body.code).toBe('PROJECT_ROLE_CHANGE_FORBIDDEN'),
      );
  });

  it('rejects an unknown Project Role', async () => {
    // Arrange
    const { ada, workspaceId, projectId, bobId } = await setUp();

    // Act
    const response = app
      .request()
      .put(`${rolesPath(workspaceId, projectId)}/${bobId}`)
      .set('Authorization', ada)
      .send({ role: 'owner' });

    // Assert
    await response.expect(HttpStatus.BAD_REQUEST);
  });
});
