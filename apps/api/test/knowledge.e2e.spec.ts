import { HttpStatus } from '@nestjs/common';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceModule } from '@intentra/workspace';

const SIGN_UP_PATH = '/api/iam/auth/sign-up';
const SIGN_IN_PATH = '/api/iam/auth/sign-in';
const WORKSPACES_PATH = '/api/workspaces';

function knowledgePath(workspaceId: string, projectId: string): string {
  return `${WORKSPACES_PATH}/${workspaceId}/projects/${projectId}/knowledge`;
}

const requirement = {
  kind: 'requirement',
  title: 'PDF export',
  fields: { statement: 'Export a report to PDF' },
};

describe('/api/workspaces/:workspaceId/projects/:projectId/knowledge', () => {
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
    await app.request().post(SIGN_UP_PATH).send(credentials);
    const response = await app
      .request()
      .post(SIGN_IN_PATH)
      .send(credentials)
      .expect(HttpStatus.OK);

    return `Bearer ${response.body.accessToken}`;
  }

  /** Ada owns the Workspace and the Project; Bob joined by Invitation and is a Viewer. */
  async function setUp(): Promise<{
    ada: string;
    bob: string;
    path: string;
  }> {
    const ada = await signIn('ada@example.com');
    const bob = await signIn('bob@example.com');
    const workspace = await app
      .request()
      .post(WORKSPACES_PATH)
      .set('Authorization', ada)
      .send({ name: 'Acme', slug: 'acme' })
      .expect(HttpStatus.CREATED);
    const invitation = await app
      .request()
      .post(`${WORKSPACES_PATH}/${workspace.body.id}/invitations`)
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
      .post(`${WORKSPACES_PATH}/${workspace.body.id}/projects`)
      .set('Authorization', ada)
      .send({ name: 'Billing', slug: 'billing' })
      .expect(HttpStatus.CREATED);

    return {
      ada,
      bob,
      path: knowledgePath(workspace.body.id, project.body.id),
    };
  }

  it('records a Draft with only the main field of its Kind', async () => {
    // Arrange
    const { ada, path } = await setUp();

    // Act
    const response = await app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send(requirement);

    // Assert
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toMatchObject({
      key: 'REQ-1',
      kind: 'requirement',
      status: 'draft',
      source: 'manual',
      rationale: null,
      fields: {
        statement: 'Export a report to PDF',
        type: null,
        priority: null,
        acceptanceCriteria: [],
      },
    });
  });

  it('rejects a Draft without its main field', async () => {
    // Arrange
    const { ada, path } = await setUp();

    // Act
    const response = await app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send({ kind: 'term', title: 'Invoice', fields: { sort: 'entity' } });

    // Assert
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.code).toBe('VALIDATION_FAILED');
  });

  it('rejects a blank main field', async () => {
    // Arrange
    const { ada, path } = await setUp();

    // Act
    const response = await app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send({ kind: 'term', title: 'Invoice', fields: { definition: ' ' } });

    // Assert
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.code).toBe('INVALID_KNOWLEDGE_FIELDS');
  });

  it('forbids a Viewer to record', async () => {
    // Arrange
    const { bob, path } = await setUp();

    // Act
    const response = await app
      .request()
      .post(path)
      .set('Authorization', bob)
      .send(requirement);

    // Assert
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(response.body.code).toBe('KNOWLEDGE_RECORDING_FORBIDDEN');
  });

  it('lists a page of the knowledge with the total', async () => {
    // Arrange
    const { ada, bob, path } = await setUp();
    for (const title of ['PDF export', 'CSV export', 'Print']) {
      await app
        .request()
        .post(path)
        .set('Authorization', ada)
        .send({ ...requirement, title })
        .expect(HttpStatus.CREATED);
    }

    // Act
    const response = await app
      .request()
      .get(path)
      .query({ kind: 'requirement', take: 2, offset: 1 })
      .set('Authorization', bob);

    // Assert
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.total).toBe(3);
    expect(
      response.body.items.map((item: { key: string }) => item.key),
    ).toEqual(['REQ-2', 'REQ-3']);
  });

  it('reads, edits and deletes a Draft by its Knowledge Key', async () => {
    // Arrange
    const { ada, path } = await setUp();
    await app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send(requirement)
      .expect(HttpStatus.CREATED);

    // Act
    const edited = await app
      .request()
      .patch(`${path}/REQ-1`)
      .set('Authorization', ada)
      .send({ kind: 'requirement', title: 'Report export' });
    const read = await app
      .request()
      .get(`${path}/REQ-1`)
      .set('Authorization', ada);
    const deleted = await app
      .request()
      .delete(`${path}/REQ-1`)
      .set('Authorization', ada);

    // Assert
    expect(edited.status).toBe(HttpStatus.OK);
    expect(read.body).toEqual(edited.body);
    expect(read.body).toMatchObject({
      title: 'Report export',
      fields: { statement: 'Export a report to PDF' },
      lastEditedAt: expect.any(String),
    });
    expect(deleted.status).toBe(HttpStatus.NO_CONTENT);
    await app
      .request()
      .get(`${path}/REQ-1`)
      .set('Authorization', ada)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('rejects a malformed Knowledge Key', async () => {
    // Arrange
    const { ada, path } = await setUp();

    // Act
    const response = await app
      .request()
      .get(`${path}/req-1`)
      .set('Authorization', ada);

    // Assert
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.code).toBe('INVALID_KNOWLEDGE_KEY');
  });
});
