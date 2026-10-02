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

  it('lists the most recently recorded first when asked', async () => {
    // Arrange
    const { ada, path } = await setUp();
    for (const body of [
      requirement,
      { kind: 'term', title: 'Invoice', fields: { definition: 'A bill' } },
      { ...requirement, title: 'CSV export' },
    ]) {
      await app
        .request()
        .post(path)
        .set('Authorization', ada)
        .send(body)
        .expect(HttpStatus.CREATED);
    }

    // Act
    const response = await app
      .request()
      .get(path)
      .query({ order: 'newest-first', take: 2 })
      .set('Authorization', ada);

    // Assert
    expect(response.status).toBe(HttpStatus.OK);
    expect(
      response.body.items.map((item: { key: string }) => item.key),
    ).toEqual(['REQ-2', 'TERM-1']);
    expect(response.body.total).toBe(3);
  });

  it('counts the whole knowledge by Kind and status, marks included', async () => {
    // Arrange
    const { ada, bob, path } = await setUp();
    const record = (body: object) =>
      app
        .request()
        .post(path)
        .set('Authorization', ada)
        .send(body)
        .expect(HttpStatus.CREATED);
    await record(requirement);
    await app
      .request()
      .post(`${path}/REQ-1/approve`)
      .set('Authorization', ada)
      .send({ version: 1 })
      .expect(HttpStatus.OK);
    await record({
      ...requirement,
      title: 'CSV export',
      links: [{ type: 'depends-on', key: 'REQ-1' }],
    });
    await record({ ...requirement, title: 'Print' });
    await app
      .request()
      .post(`${path}/REQ-3/reject`)
      .set('Authorization', ada)
      .send({ version: 1 })
      .expect(HttpStatus.OK);
    await app
      .request()
      .post(`${path}/REQ-1/retire`)
      .set('Authorization', ada)
      .send({ version: 2 })
      .expect(HttpStatus.OK);
    await record({
      kind: 'term',
      title: 'Invoice',
      fields: { definition: 'What a customer pays' },
    });

    // Act
    const response = await app
      .request()
      .get(`${path}/summary`)
      .set('Authorization', bob);

    // Assert
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.kinds).toHaveLength(11);
    expect(
      response.body.kinds.find(
        (entry: { kind: string }) => entry.kind === 'requirement',
      ),
    ).toEqual({
      kind: 'requirement',
      statuses: { draft: 1, approved: 0, rejected: 1, obsolete: 1 },
      needsReview: 1,
    });
    expect(
      response.body.kinds.find(
        (entry: { kind: string }) => entry.kind === 'term',
      ),
    ).toEqual({
      kind: 'term',
      statuses: { draft: 1, approved: 0, rejected: 0, obsolete: 0 },
      needsReview: 0,
    });
    expect(response.body.access).toEqual({ canRecord: [] });
  });

  it('counts and lists the Gaps: the skeleton, empty fields and the Approved items linked to nothing', async () => {
    // Arrange
    const { ada, path } = await setUp();
    for (const body of [
      requirement,
      {
        kind: 'term',
        title: 'Report',
        fields: { definition: 'What a customer prints' },
      },
      {
        ...requirement,
        title: 'Report header',
        links: [{ type: 'uses-term', key: 'TERM-1' }],
      },
      {
        ...requirement,
        title: 'Fast export',
        fields: { statement: 'Export within a second', type: 'non-functional' },
      },
      {
        ...requirement,
        title: 'Signed export',
        fields: { statement: 'Sign every export', priority: 'must' },
      },
    ]) {
      await app
        .request()
        .post(path)
        .set('Authorization', ada)
        .send(body)
        .expect(HttpStatus.CREATED);
    }
    await app
      .request()
      .post(`${path}/approve`)
      .set('Authorization', ada)
      .send({
        items: ['REQ-1', 'TERM-1', 'REQ-2', 'REQ-3'].map(key => ({
          key,
          version: 1,
        })),
      })
      .expect(HttpStatus.OK);

    // Act
    const summary = await app
      .request()
      .get(`${path}/summary`)
      .set('Authorization', ada);
    const gaps = await app
      .request()
      .get(`${path}/gaps`)
      .set('Authorization', ada);

    // Assert
    expect(summary.body.gaps).toBe(5);
    expect(gaps.status).toBe(HttpStatus.OK);
    expect(gaps.body.gaps).toEqual([
      { rule: 'no-product-overview', item: null },
      { rule: 'no-persona', item: null },
      { rule: 'no-goal', item: null },
      {
        rule: 'requirement-without-acceptance-criteria',
        item: {
          key: 'REQ-4',
          kind: 'requirement',
          title: 'Signed export',
          status: 'draft',
        },
      },
      {
        rule: 'unlinked',
        item: {
          key: 'REQ-1',
          kind: 'requirement',
          title: 'PDF export',
          status: 'approved',
        },
      },
    ]);
  });

  it('hides the summary from someone outside the Workspace', async () => {
    // Arrange
    const { path } = await setUp();
    const eve = await signIn('eve@example.com');

    // Act
    const response = await app
      .request()
      .get(`${path}/summary`)
      .set('Authorization', eve);

    // Assert
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
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
      .send({ kind: 'requirement', version: 1, title: 'Report export' });
    const read = await app
      .request()
      .get(`${path}/REQ-1`)
      .set('Authorization', ada);
    const deleted = await app
      .request()
      .delete(`${path}/REQ-1`)
      .set('Authorization', ada)
      .send({ version: 2 });

    // Assert
    expect(edited.status).toBe(HttpStatus.OK);
    expect(read.body).toEqual({
      ...edited.body,
      dependencyNeedsReview: false,
    });
    expect(read.body).toMatchObject({
      title: 'Report export',
      fields: { statement: 'Export a report to PDF' },
      lastEditedAt: expect.any(String),
      version: 2,
    });
    expect(deleted.status).toBe(HttpStatus.NO_CONTENT);
    await app
      .request()
      .get(`${path}/REQ-1`)
      .set('Authorization', ada)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('approves a Draft on the version the Maintainer saw', async () => {
    // Arrange
    const { ada, path } = await setUp();
    await app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send(requirement)
      .expect(HttpStatus.CREATED);

    // Act
    const approved = await app
      .request()
      .post(`${path}/REQ-1/approve`)
      .set('Authorization', ada)
      .send({ version: 1 });

    // Assert
    expect(approved.status).toBe(HttpStatus.OK);
    expect(approved.body).toMatchObject({
      status: 'approved',
      version: 2,
      access: { canEdit: false, canApprove: false },
    });
    const editing = await app
      .request()
      .patch(`${path}/REQ-1`)
      .set('Authorization', ada)
      .send({ kind: 'requirement', version: 2, title: 'Export' });
    expect(editing.status).toBe(HttpStatus.CONFLICT);
    expect(editing.body.code).toBe('KNOWLEDGE_ITEM_NOT_DRAFT');
  });

  it('refuses a change made on an older version', async () => {
    // Arrange
    const { ada, path } = await setUp();
    await app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send(requirement)
      .expect(HttpStatus.CREATED);
    await app
      .request()
      .patch(`${path}/REQ-1`)
      .set('Authorization', ada)
      .send({ kind: 'requirement', version: 1, title: 'Report export' })
      .expect(HttpStatus.OK);

    // Act
    const response = await app
      .request()
      .post(`${path}/REQ-1/approve`)
      .set('Authorization', ada)
      .send({ version: 1 });

    // Assert
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(response.body.code).toBe('KNOWLEDGE_ITEM_CHANGED');
  });

  it('rejects a Draft and lists it only when asked for', async () => {
    // Arrange
    const { ada, bob, path } = await setUp();
    await app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send(requirement)
      .expect(HttpStatus.CREATED);

    // Act
    const rejected = await app
      .request()
      .post(`${path}/REQ-1/reject`)
      .set('Authorization', ada)
      .send({ version: 1, reason: 'Customers never print' });

    // Assert
    expect(rejected.status).toBe(HttpStatus.OK);
    expect(rejected.body).toMatchObject({
      status: 'rejected',
      rejectionReason: 'Customers never print',
    });
    const listed = await app
      .request()
      .get(path)
      .set('Authorization', bob)
      .expect(HttpStatus.OK);
    expect(listed.body).toMatchObject({
      items: [],
      total: 0,
      access: { canRecord: [] },
    });
    const asked = await app
      .request()
      .get(path)
      .query({ statuses: 'rejected' })
      .set('Authorization', bob)
      .expect(HttpStatus.OK);
    expect(asked.body.total).toBe(1);
  });

  it('forbids a Viewer to approve', async () => {
    // Arrange
    const { ada, bob, path } = await setUp();
    await app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send(requirement)
      .expect(HttpStatus.CREATED);

    // Act
    const response = await app
      .request()
      .post(`${path}/REQ-1/approve`)
      .set('Authorization', bob)
      .send({ version: 1 });

    // Assert
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(response.body.code).toBe('DRAFT_APPROVAL_FORBIDDEN');
  });

  it('replaces an Approved item, then retires the replacement', async () => {
    // Arrange
    const { ada, path } = await setUp();
    await app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send(requirement)
      .expect(HttpStatus.CREATED);
    await app
      .request()
      .post(`${path}/REQ-1/approve`)
      .set('Authorization', ada)
      .send({ version: 1 })
      .expect(HttpStatus.OK);
    await app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send({
        ...requirement,
        supersedes: 'REQ-1',
        fields: { statement: 'Export a report to PDF and CSV' },
      })
      .expect(HttpStatus.CREATED);

    // Act
    const replacing = await app
      .request()
      .post(`${path}/REQ-2/approve`)
      .set('Authorization', ada)
      .send({ version: 1 });
    const retiring = await app
      .request()
      .post(`${path}/REQ-2/retire`)
      .set('Authorization', ada)
      .send({ version: 2, reason: 'Printing was dropped' });

    // Assert
    expect(replacing.status).toBe(HttpStatus.OK);
    expect(retiring.status).toBe(HttpStatus.OK);
    expect(retiring.body).toMatchObject({
      status: 'obsolete',
      supersedes: 'REQ-1',
      retirementReason: 'Printing was dropped',
    });
    const replaced = await app
      .request()
      .get(`${path}/REQ-1`)
      .set('Authorization', ada)
      .expect(HttpStatus.OK);
    expect(replaced.body).toMatchObject({
      status: 'obsolete',
      supersededByKey: 'REQ-2',
    });
    const listed = await app
      .request()
      .get(path)
      .query({ statuses: 'obsolete' })
      .set('Authorization', ada)
      .expect(HttpStatus.OK);
    expect(listed.body.total).toBe(2);
  });

  it('approves Drafts together and marks what rests on a replaced item', async () => {
    // Arrange
    const { ada, path } = await setUp();
    for (const body of [
      requirement,
      {
        ...requirement,
        title: 'Export button',
        fields: { statement: 'A button exports the report' },
        links: [{ type: 'depends-on', key: 'REQ-1' }],
      },
    ]) {
      await app
        .request()
        .post(path)
        .set('Authorization', ada)
        .send(body)
        .expect(HttpStatus.CREATED);
    }
    const cascade = await app
      .request()
      .get(`${path}/REQ-2/dependencies`)
      .set('Authorization', ada)
      .expect(HttpStatus.OK);

    // Act
    const approved = await app
      .request()
      .post(`${path}/approve`)
      .set('Authorization', ada)
      .send({
        items: cascade.body.items.map(
          ({ key, version }: { key: string; version: number }) => ({
            key,
            version,
          }),
        ),
      });

    // Assert
    expect(approved.status).toBe(HttpStatus.OK);
    expect(approved.body).toHaveLength(2);
    await app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send({
        ...requirement,
        supersedes: 'REQ-1',
        fields: { statement: 'Export a report to PDF and CSV' },
      })
      .expect(HttpStatus.CREATED);
    await app
      .request()
      .post(`${path}/REQ-3/approve`)
      .set('Authorization', ada)
      .send({ version: 1 })
      .expect(HttpStatus.OK);
    const marked = await app
      .request()
      .get(`${path}/REQ-2`)
      .set('Authorization', ada)
      .expect(HttpStatus.OK);
    expect(marked.body).toMatchObject({
      needsReview: true,
      reviewCauses: ['REQ-1'],
    });
    const confirmed = await app
      .request()
      .post(`${path}/REQ-2/confirm`)
      .set('Authorization', ada)
      .send({ version: marked.body.version })
      .expect(HttpStatus.OK);
    expect(confirmed.body).toMatchObject({
      needsReview: false,
      links: [{ type: 'depends-on', key: 'REQ-3' }],
    });
  });

  it('approves an answer together with the Draft Open Question it answers', async () => {
    // Arrange
    const { ada, path } = await setUp();
    for (const body of [
      requirement,
      {
        kind: 'open-question',
        title: 'Report format',
        fields: { question: 'Which format does the export use?' },
        links: [{ type: 'depends-on', key: 'REQ-1' }],
      },
      {
        kind: 'decision',
        title: 'PDF export',
        fields: { decision: 'The report is exported to PDF' },
        links: [{ type: 'answers', key: 'TBD-1' }],
      },
    ]) {
      await app
        .request()
        .post(path)
        .set('Authorization', ada)
        .send(body)
        .expect(HttpStatus.CREATED);
    }
    const alone = await app
      .request()
      .post(`${path}/DEC-1/approve`)
      .set('Authorization', ada)
      .send({ version: 1 });
    const cascade = await app
      .request()
      .get(`${path}/DEC-1/dependencies`)
      .set('Authorization', ada)
      .expect(HttpStatus.OK);

    // Act
    const approved = await app
      .request()
      .post(`${path}/approve`)
      .set('Authorization', ada)
      .send({
        items: cascade.body.items.map(
          ({ key, version }: { key: string; version: number }) => ({
            key,
            version,
          }),
        ),
      });

    // Assert
    expect(alone.status).toBe(HttpStatus.CONFLICT);
    expect(alone.body.code).toBe('ANSWERED_QUESTIONS_NOT_APPROVED');
    expect(cascade.body.items.map(({ key }: { key: string }) => key)).toEqual([
      'DEC-1',
      'TBD-1',
      'REQ-1',
    ]);
    expect(cascade.body.answers).toEqual([{ from: 'DEC-1', to: 'TBD-1' }]);
    expect(approved.status).toBe(HttpStatus.OK);
    const question = await app
      .request()
      .get(`${path}/TBD-1`)
      .set('Authorization', ada)
      .expect(HttpStatus.OK);
    expect(question.body).toMatchObject({
      status: 'approved',
      answeredBy: ['DEC-1'],
    });
  });

  it('lets only an Open Question say what it concerns', async () => {
    // Arrange
    const { ada, path } = await setUp();
    await app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send(requirement)
      .expect(HttpStatus.CREATED);

    // Act
    const question = await app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send({
        kind: 'open-question',
        title: 'Revoking by a Manager',
        fields: { question: 'May a Manager revoke an Invitation?' },
        links: [{ type: 'concerns', key: 'REQ-1' }],
      });
    const fromRequirement = await app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send({
        ...requirement,
        links: [{ type: 'concerns', key: 'REQ-1' }],
      });

    // Assert
    expect(question.status).toBe(HttpStatus.CREATED);
    expect(question.body.links).toEqual([{ type: 'concerns', key: 'REQ-1' }]);
    expect(fromRequirement.body.code).toBe('INVALID_LINK');
    expect(fromRequirement.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('refuses a batch listing one item twice', async () => {
    // Arrange
    const { ada, path } = await setUp();
    await app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send(requirement)
      .expect(HttpStatus.CREATED);

    // Act
    const response = await app
      .request()
      .post(`${path}/approve`)
      .set('Authorization', ada)
      .send({
        items: [
          { key: 'REQ-1', version: 1 },
          { key: 'REQ-1', version: 1 },
        ],
      });

    // Assert
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.code).toBe('VALIDATION_FAILED');
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
