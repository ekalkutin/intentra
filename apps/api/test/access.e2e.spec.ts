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

function accessPath(workspaceId: string): string {
  return `${WORKSPACES_PATH}/${workspaceId}/access`;
}

describe('/api/workspaces/:workspaceId/access', () => {
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

  /** Ada owns the Workspace and one Project in it. */
  async function setUp(): Promise<{
    ada: string;
    workspaceId: string;
    projectId: string;
  }> {
    const ada = await signIn('ada@example.com');
    const workspace = await app
      .request()
      .post(WORKSPACES_PATH)
      .set('Authorization', ada)
      .send({ name: 'Acme', slug: 'acme' })
      .expect(HttpStatus.CREATED);
    const project = await app
      .request()
      .post(`${WORKSPACES_PATH}/${workspace.body.id}/projects`)
      .set('Authorization', ada)
      .send({ name: 'Billing', slug: 'billing' })
      .expect(HttpStatus.CREATED);

    return { ada, workspaceId: workspace.body.id, projectId: project.body.id };
  }

  it("returns the Owner's access to the Workspace and its Projects", async () => {
    // Arrange
    const { ada, workspaceId, projectId } = await setUp();

    // Act
    const response = app
      .request()
      .get(accessPath(workspaceId))
      .set('Authorization', ada);

    // Assert
    await response.expect(HttpStatus.OK).expect(res =>
      expect(res.body).toEqual({
        memberId: expect.any(String),
        suspended: false,
        role: 'owner',
        canManageInvitations: true,
        canManageMembers: true,
        canCreateProjects: true,
        canDeleteWorkspace: true,
        canSeeAllPersonalAccessTokens: true,
        canManageProviderKey: true,
        projects: {
          [projectId]: {
            role: 'maintainer',
            canChangeProjectRoles: true,
            canDelete: true,
          },
        },
      }),
    );
  });

  it('hides a Workspace from an Account that is not its Member', async () => {
    // Arrange
    const { workspaceId } = await setUp();
    const eve = await signIn('eve@example.com');

    // Act
    const response = app
      .request()
      .get(accessPath(workspaceId))
      .set('Authorization', eve);

    // Assert
    await response.expect(HttpStatus.NOT_FOUND);
  });

  it('rejects a request without an access token', async () => {
    // Arrange
    const { workspaceId } = await setUp();

    // Act
    const response = app.request().get(accessPath(workspaceId));

    // Assert
    await response.expect(HttpStatus.UNAUTHORIZED);
  });
});
