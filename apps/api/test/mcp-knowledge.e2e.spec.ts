import { HttpStatus } from '@nestjs/common';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceModule } from '@intentra/workspace';

const SIGN_UP_PATH = '/api/iam/auth/sign-up';
const SIGN_IN_PATH = '/api/iam/auth/sign-in';
const WORKSPACES_PATH = '/api/workspaces';
const MCP_PATH = '/api/mcp';

type ToolResult = {
  readonly isError?: boolean;
  readonly content: readonly { readonly text: string }[];
  readonly structuredContent?: Record<string, unknown>;
};

const requirement = {
  title: 'PDF export',
  rationale: 'Ada: "customers print reports"',
  fields: { statement: 'Export a report to PDF' },
};

describe('Knowledge tools over MCP', () => {
  let app: TestingApp;
  let secret: string;
  let projectId: string;

  /** Calls a tool with the Contributor-level token and reads its result from the stream. */
  async function callTool(name: string, args: object): Promise<ToolResult> {
    const response = await app
      .request()
      .post(MCP_PATH)
      .set('Accept', 'application/json, text/event-stream')
      .set('Authorization', `Bearer ${secret}`)
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name, arguments: args },
      })
      .expect(HttpStatus.OK);
    const data = response.text
      .split('\n')
      .find(line => line.startsWith('data: '));

    return JSON.parse(data?.slice('data: '.length) ?? response.text).result;
  }

  /** Ada owns the Workspace and the Project, and gives her agent a Contributor-level token. */
  async function setUp(): Promise<void> {
    const credentials = {
      email: 'ada@example.com',
      password: 'correct-horse-battery-staple',
    };
    await app.request().post(SIGN_UP_PATH).send(credentials);
    const session = await app
      .request()
      .post(SIGN_IN_PATH)
      .send(credentials)
      .expect(HttpStatus.OK);
    const authorization = `Bearer ${session.body.accessToken}`;
    const workspace = await app
      .request()
      .post(WORKSPACES_PATH)
      .set('Authorization', authorization)
      .send({ name: 'Acme', slug: 'acme' })
      .expect(HttpStatus.CREATED);
    const project = await app
      .request()
      .post(`${WORKSPACES_PATH}/${workspace.body.id}/projects`)
      .set('Authorization', authorization)
      .send({ name: 'Billing', slug: 'bill-svc' })
      .expect(HttpStatus.CREATED);
    const token = await app
      .request()
      .post(`${WORKSPACES_PATH}/${workspace.body.id}/personal-access-tokens`)
      .set('Authorization', authorization)
      .send({ name: 'Claude Code', level: 'contributor' })
      .expect(HttpStatus.CREATED);
    secret = token.body.secret;
    projectId = project.body.id;
  }

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

  beforeEach(async () => {
    await app.clearDatabase();
    await setUp();
  });

  afterAll(() => app?.close());

  it('lists the Projects with the Project Role and the token level', async () => {
    // Act
    const result = await callTool('list_projects', {});

    // Assert
    expect(result.structuredContent).toEqual({
      projects: [
        {
          id: projectId,
          name: 'Billing',
          slug: 'bill-svc',
          role: 'maintainer',
        },
      ],
      tokenLevel: 'contributor',
    });
  });

  it('records a Draft that only a listing asking for Drafts shows', async () => {
    // Act
    const recorded = await callTool('record_requirement', {
      projectId,
      ...requirement,
    });

    // Assert
    expect(recorded.structuredContent).toMatchObject({
      key: 'REQ-1',
      kind: 'requirement',
      status: 'draft',
      source: 'external-agent',
      version: 1,
      access: { canEdit: true, canApprove: false },
    });
    const approvedOnly = await callTool('list_knowledge', { projectId });
    expect(approvedOnly.structuredContent).toMatchObject({
      items: [],
      total: 0,
    });
    const withDrafts = await callTool('list_knowledge', {
      projectId,
      statuses: ['approved', 'draft'],
    });
    expect(withDrafts.structuredContent).toEqual({
      items: [
        {
          key: 'REQ-1',
          kind: 'requirement',
          title: 'PDF export',
          mainField: 'Export a report to PDF',
          status: 'draft',
          version: 1,
        },
      ],
      total: 1,
      canRecord: ['term', 'requirement', 'decision'],
    });
  });

  it('refuses a recording without a rationale', async () => {
    // Act
    const result = await callTool('record_term', {
      projectId,
      title: 'Invoice',
      fields: { definition: 'A bill sent to a customer' },
    });

    // Assert
    expect(result.isError).toBe(true);
  });

  it("keeps the agent to its token's level when approving", async () => {
    // Arrange
    await callTool('record_requirement', { projectId, ...requirement });

    // Act
    const result = await callTool('approve_knowledge_item', {
      projectId,
      key: 'REQ-1',
      version: 1,
    });

    // Assert
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toMatch(/^DRAFT_APPROVAL_FORBIDDEN: /);
  });

  it('tells the agent to read again when the item has changed', async () => {
    // Arrange
    await callTool('record_requirement', { projectId, ...requirement });
    await callTool('edit_requirement', {
      projectId,
      key: 'REQ-1',
      version: 1,
      title: 'Report export',
    });

    // Act
    const result = await callTool('edit_requirement', {
      projectId,
      key: 'REQ-1',
      version: 1,
      title: 'PDF and CSV export',
    });

    // Assert
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toMatch(/^KNOWLEDGE_ITEM_CHANGED: /);
  });

  it('deletes a Draft recorded by mistake', async () => {
    // Arrange
    await callTool('record_requirement', { projectId, ...requirement });

    // Act
    const result = await callTool('delete_knowledge_draft', {
      projectId,
      key: 'REQ-1',
      version: 1,
    });

    // Assert
    expect(result.structuredContent).toEqual({ deleted: 'REQ-1' });
    const read = await callTool('get_knowledge_item', {
      projectId,
      key: 'REQ-1',
    });
    expect(read.content[0]?.text).toMatch(/^KNOWLEDGE_ITEM_NOT_FOUND: /);
  });
});
