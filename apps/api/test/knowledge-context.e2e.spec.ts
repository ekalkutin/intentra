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

/** Recorded in this order, so each gets the Knowledge Key named beside it. */
const PROJECT = [
  // PER-1
  {
    kind: 'persona',
    title: 'Owner',
    fields: { profile: 'Owns the Workspace' },
  },
  // SC-1
  {
    kind: 'scenario',
    title: 'Invite a Member',
    fields: { expectedResult: 'The invitee joins the Workspace' },
    links: [{ type: 'depends-on', key: 'PER-1' }],
  },
  // DEC-1
  {
    kind: 'decision',
    title: 'Invitations expire',
    fields: { decision: 'An Invitation lives seven days' },
  },
  // TERM-1
  {
    kind: 'term',
    title: 'Invitation',
    fields: { definition: 'An offer to join a Workspace' },
  },
  // REQ-1, the Anchor
  {
    kind: 'requirement',
    title: 'Revoke an Invitation',
    fields: {
      statement: 'An Owner revokes a pending Invitation',
      acceptanceCriteria: ['The invitee can no longer accept it'],
    },
    links: [
      { type: 'depends-on', key: 'SC-1' },
      { type: 'justified-by', key: 'DEC-1' },
      { type: 'uses-term', key: 'TERM-1' },
    ],
  },
  // BR-1
  {
    kind: 'business-rule',
    title: 'Revoked stays revoked',
    fields: { rule: 'A revoked Invitation cannot be accepted' },
    links: [{ type: 'depends-on', key: 'REQ-1' }],
  },
  // REQ-2
  {
    kind: 'requirement',
    title: 'Invitations are final',
    fields: { statement: 'A sent Invitation cannot be withdrawn' },
    links: [{ type: 'conflicts-with', key: 'REQ-1' }],
  },
  // TBD-1
  {
    kind: 'open-question',
    title: 'Revoking by a Manager',
    fields: { question: 'May a Manager revoke an Invitation?' },
    links: [{ type: 'concerns', key: 'REQ-1' }],
  },
  // TBD-2
  {
    kind: 'open-question',
    title: 'Notifying the invitee',
    fields: { question: 'Is the invitee told of the revocation?' },
    links: [{ type: 'concerns', key: 'REQ-1' }],
  },
  // DEC-2, answering TBD-2
  {
    kind: 'decision',
    title: 'No notice',
    fields: { decision: 'The invitee is not told' },
    links: [{ type: 'answers', key: 'TBD-2' }],
  },
  // PO-1
  {
    kind: 'product-overview',
    title: 'Acme',
    fields: { summary: 'A billing tool for small teams' },
  },
  // CON-1
  {
    kind: 'constraint',
    title: 'EU only',
    fields: { constraint: 'All data stays in the EU' },
  },
  // REQ-3, non-functional
  {
    kind: 'requirement',
    title: 'Fast answers',
    fields: { statement: 'Every answer within 300 ms', type: 'non-functional' },
  },
  // BR-2, a rule on the foundation
  {
    kind: 'business-rule',
    title: 'One email, one Invitation',
    fields: { rule: 'An email has at most one pending Invitation' },
    links: [{ type: 'depends-on', key: 'SC-1' }],
  },
  // REQ-4, resting on the Anchor
  {
    kind: 'requirement',
    title: 'Audit revocations',
    fields: { statement: 'Every revocation is logged' },
    links: [{ type: 'depends-on', key: 'REQ-1' }],
  },
];

describe('/api/workspaces/:workspaceId/projects/:projectId/knowledge/context', () => {
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

  /**
   * Records and approves PROJECT, then records REQ-5, a Draft resting on
   * REQ-1, and BR-3, a Draft merely using TERM-1.
   */
  async function givenProject(ada: string, path: string): Promise<void> {
    for (const body of PROJECT) {
      await app
        .request()
        .post(path)
        .set('Authorization', ada)
        .send(body)
        .expect(HttpStatus.CREATED);
    }
    const drafts = await app
      .request()
      .get(path)
      .query({ statuses: 'draft', take: 200 })
      .set('Authorization', ada)
      .expect(HttpStatus.OK);
    await app
      .request()
      .post(`${path}/approve`)
      .set('Authorization', ada)
      .send({
        items: drafts.body.items.map(
          ({ key, version }: { key: string; version: number }) => ({
            key,
            version,
          }),
        ),
      })
      .expect(HttpStatus.OK);
    await app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send({
        kind: 'requirement',
        title: 'Revoke in bulk',
        fields: { statement: 'An Owner revokes several Invitations at once' },
        links: [{ type: 'depends-on', key: 'REQ-1' }],
      })
      .expect(HttpStatus.CREATED);
    await app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send({
        kind: 'business-rule',
        title: 'Invitation wording',
        fields: { rule: 'An Invitation names who sent it' },
        links: [{ type: 'uses-term', key: 'TERM-1' }],
      })
      .expect(HttpStatus.CREATED);
  }

  it('gathers the Approved knowledge around the Anchors, each under its role', async () => {
    // Arrange
    const { ada, bob, path } = await setUp();
    await givenProject(ada, path);

    // Act
    const response = await app
      .request()
      .get(`${path}/context`)
      .query({ anchors: 'REQ-1' })
      .set('Authorization', bob);

    // Assert
    expect(response.status).toBe(HttpStatus.OK);
    expect(
      response.body.items.map(
        ({ key, role, distance }: Record<string, unknown>) => [
          key,
          role,
          distance,
        ],
      ),
    ).toEqual([
      ['REQ-1', 'anchor', 0],
      ['REQ-2', 'conflict', 1],
      ['TBD-1', 'unsettled', 1],
      ['BR-1', 'rule', 1],
      ['BR-2', 'rule', 2],
      ['SC-1', 'foundation', 1],
      ['DEC-1', 'foundation', 1],
      ['PER-1', 'foundation', 2],
      ['REQ-4', 'may-be-affected', 1],
      ['TERM-1', 'term', 1],
    ]);
    expect(response.body.items[0]).toMatchObject({
      detail: 'full',
      fields: { acceptanceCriteria: ['The invitee can no longer accept it'] },
    });
    expect(response.body.draftsNearby).toEqual([
      { key: 'REQ-5', kind: 'requirement', title: 'Revoke in bulk' },
    ]);
    expect(response.body.frameSize).toBe(3);
    expect(response.body.links).toContainEqual({
      from: 'SC-1',
      to: 'PER-1',
      type: 'depends-on',
    });
    expect(response.body.markdown).toContain(
      '### REQ-1 · Requirement · Revoke an Invitation',
    );
    expect(response.body.markdown).toContain(
      'REQ-5 (Requirement: Revoke in bulk)',
    );
    expect(response.body.markdown).not.toContain('TBD-2');
  });

  it('refuses a Draft as an Anchor', async () => {
    // Arrange
    const { ada, path } = await setUp();
    await givenProject(ada, path);

    // Act
    const response = await app
      .request()
      .get(`${path}/context`)
      .query({ anchors: 'REQ-1,REQ-5' })
      .set('Authorization', ada);

    // Assert
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(response.body.code).toBe('ANCHOR_NOT_APPROVED');
    expect(response.body.message).toContain('REQ-5');
  });

  it('names an Anchor that does not exist', async () => {
    // Arrange
    const { ada, path } = await setUp();

    // Act
    const response = await app
      .request()
      .get(`${path}/context`)
      .query({ anchors: 'REQ-99' })
      .set('Authorization', ada);

    // Assert
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(response.body.message).toContain('REQ-99');
  });

  it('gives the Project Frame: the overview, the constraints, the qualities and the architecture', async () => {
    // Arrange
    const { ada, bob, path } = await setUp();
    await givenProject(ada, path);
    for (const body of [
      {
        kind: 'decision',
        title: 'One database per tenant',
        fields: {
          decision: 'Each tenant has its own database',
          area: 'architecture',
        },
      },
      {
        kind: 'decision',
        title: 'Monthly plans only',
        fields: { decision: 'Plans are billed monthly', area: 'business' },
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
      .send({ items: ['DEC-3', 'DEC-4'].map(key => ({ key, version: 1 })) })
      .expect(HttpStatus.OK);

    // Act
    const response = await app
      .request()
      .get(`${path}/frame`)
      .set('Authorization', bob);

    // Assert
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.items.map(({ key }: { key: string }) => key)).toEqual([
      'PO-1',
      'CON-1',
      'REQ-3',
      'DEC-3',
    ]);
    expect(response.body.markdown).toContain('## Quality requirements');
    expect(response.body.markdown).toContain('## Architecture decisions');
  });
});
