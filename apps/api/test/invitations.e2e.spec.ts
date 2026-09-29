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
const INVITATIONS_PATH = '/api/invitations';

function workspaceInvitationsPath(workspaceId: string): string {
  return `${WORKSPACES_PATH}/${workspaceId}/invitations`;
}

describe('Invitations', () => {
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

  async function invite(
    owner: string,
    workspaceId: string,
    email: string,
  ): Promise<string> {
    const response = await app
      .request()
      .post(workspaceInvitationsPath(workspaceId))
      .set('Authorization', owner)
      .send({ email })
      .expect(HttpStatus.CREATED);

    return response.body.id;
  }

  it('lets the invitee find, open and accept the Invitation', async () => {
    // Arrange
    const owner = await signIn('ada@example.com');
    const workspaceId = await createWorkspace(owner);
    const invitee = await signIn('bob@example.com');
    const invitationId = await invite(owner, workspaceId, 'bob@example.com');

    // Act
    const received = await app
      .request()
      .get(INVITATIONS_PATH)
      .set('Authorization', invitee)
      .expect(HttpStatus.OK);
    const opened = await app
      .request()
      .get(`${INVITATIONS_PATH}/${invitationId}`)
      .set('Authorization', invitee)
      .expect(HttpStatus.OK);
    const accepted = await app
      .request()
      .post(`${INVITATIONS_PATH}/${invitationId}/accept`)
      .set('Authorization', invitee)
      .expect(HttpStatus.OK);

    // Assert
    expect(received.body).toEqual([opened.body]);
    expect(opened.body).toMatchObject({
      id: invitationId,
      workspaceId,
      workspaceName: 'Acme',
      status: 'pending',
    });
    expect(accepted.body.status).toBe('accepted');
    await app
      .request()
      .get(WORKSPACES_PATH)
      .set('Authorization', invitee)
      .expect(HttpStatus.OK)
      .expect(res =>
        expect(res.body).toEqual([
          expect.objectContaining({ id: workspaceId }),
        ]),
      );
  });

  it('hides the Invitation from another Account', async () => {
    // Arrange
    const owner = await signIn('ada@example.com');
    const workspaceId = await createWorkspace(owner);
    const invitationId = await invite(owner, workspaceId, 'bob@example.com');
    const stranger = await signIn('eve@example.com');

    // Act
    const response = app
      .request()
      .post(`${INVITATIONS_PATH}/${invitationId}/accept`)
      .set('Authorization', stranger);

    // Assert
    await response
      .expect(HttpStatus.NOT_FOUND)
      .expect(res => expect(res.body.code).toBe('INVITATION_NOT_FOUND'));
  });

  it('lets the Owner revoke an Invitation', async () => {
    // Arrange
    const owner = await signIn('ada@example.com');
    const workspaceId = await createWorkspace(owner);
    const invitationId = await invite(owner, workspaceId, 'bob@example.com');
    const invitee = await signIn('bob@example.com');

    // Act
    await app
      .request()
      .post(`${workspaceInvitationsPath(workspaceId)}/${invitationId}/revoke`)
      .set('Authorization', owner)
      .expect(HttpStatus.OK);

    // Assert
    await app
      .request()
      .post(`${INVITATIONS_PATH}/${invitationId}/accept`)
      .set('Authorization', invitee)
      .expect(HttpStatus.CONFLICT)
      .expect(res => expect(res.body.code).toBe('INVITATION_NOT_PENDING'));
  });

  it('rejects the email of an Active Member', async () => {
    // Arrange
    const owner = await signIn('ada@example.com');
    const workspaceId = await createWorkspace(owner);

    // Act
    const response = app
      .request()
      .post(workspaceInvitationsPath(workspaceId))
      .set('Authorization', owner)
      .send({ email: 'ADA@example.com' });

    // Assert
    await response
      .expect(HttpStatus.CONFLICT)
      .expect(res => expect(res.body.code).toBe('ALREADY_WORKSPACE_MEMBER'));
  });

  it('rejects an invalid email', async () => {
    // Arrange
    const owner = await signIn('ada@example.com');
    const workspaceId = await createWorkspace(owner);

    // Act
    const response = app
      .request()
      .post(workspaceInvitationsPath(workspaceId))
      .set('Authorization', owner)
      .send({ email: 'not-an-email' });

    // Assert
    await response
      .expect(HttpStatus.BAD_REQUEST)
      .expect(res => expect(res.body.code).toBe('INVALID_EMAIL'));
  });
});
