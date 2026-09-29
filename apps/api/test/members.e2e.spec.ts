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

function membersPath(workspaceId: string): string {
  return `${WORKSPACES_PATH}/${workspaceId}/members`;
}

describe('/api/workspaces/:workspaceId/members', () => {
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

  it('shows a Member who joined by Invitation', async () => {
    // Arrange
    const owner = await signIn('ada@example.com');
    const workspaceId = await createWorkspace(owner);
    const invitee = await signIn('bob@example.com');
    const invitation = await app
      .request()
      .post(`${WORKSPACES_PATH}/${workspaceId}/invitations`)
      .set('Authorization', owner)
      .send({ email: 'bob@example.com' })
      .expect(HttpStatus.CREATED);
    await app
      .request()
      .post(`/api/invitations/${invitation.body.id}/accept`)
      .set('Authorization', invitee)
      .expect(HttpStatus.OK);

    // Act
    const response = app
      .request()
      .get(membersPath(workspaceId))
      .set('Authorization', invitee);

    // Assert
    await response
      .expect(HttpStatus.OK)
      .expect(res =>
        expect(res.body).toEqual([
          expect.objectContaining({ email: 'ada@example.com', isOwner: true }),
          expect.objectContaining({ email: 'bob@example.com', isOwner: false }),
        ]),
      );
  });

  it('hides the Workspace from an outsider', async () => {
    // Arrange
    const workspaceId = await createWorkspace(await signIn('ada@example.com'));
    const outsider = await signIn('eve@example.com');

    // Act
    const response = app
      .request()
      .get(membersPath(workspaceId))
      .set('Authorization', outsider);

    // Assert
    await response
      .expect(HttpStatus.NOT_FOUND)
      .expect(res => expect(res.body.code).toBe('WORKSPACE_NOT_FOUND'));
  });
});
