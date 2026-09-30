import { HttpStatus } from '@nestjs/common';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { GatewayModule, type GatewayModuleOptions } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceModule } from '@intentra/workspace';

const SIGN_UP_PATH = '/api/iam/auth/sign-up';
const SIGN_IN_PATH = '/api/iam/auth/sign-in';
const WORKSPACES_PATH = '/api/workspaces';

const usage = { inputTokens: 1, outputTokens: 1, totalTokens: 2 };

type StreamPart = { readonly type: string } & Record<string, unknown>;

/** What the stand-in model streams, one list per call. */
let turns: StreamPart[][] = [];

/** A stand-in for the LLM: each call streams the next of `turns`. */
const scriptedModel = {
  specificationVersion: 'v2',
  provider: 'test',
  modelId: 'scripted',
  supportedUrls: {},
  doGenerate: () => Promise.reject(new Error('Only streaming is scripted')),
  doStream: async () => {
    const parts = turns.shift() ?? [];

    return {
      stream: new ReadableStream({
        start(controller) {
          for (const part of parts) controller.enqueue(part);
          controller.close();
        },
      }),
    };
  },
} as const;

function answer(text: string): StreamPart[] {
  return [
    { type: 'text-start', id: 'text-1' },
    { type: 'text-delta', id: 'text-1', delta: text },
    { type: 'text-end', id: 'text-1' },
    { type: 'finish', finishReason: 'stop', usage },
  ];
}

function toolCall(toolName: string, input: object): StreamPart[] {
  return [
    {
      type: 'tool-call',
      toolCallId: 'call-1',
      toolName,
      input: JSON.stringify(input),
    },
    { type: 'finish', finishReason: 'tool-calls', usage },
  ];
}

function createApp(options: GatewayModuleOptions): Promise<TestingApp> {
  return TestingApp.create({
    imports: [
      GatewayModule.register({
        ...options,
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
}

/** The server-sent events of a chat response. */
function readEvents(text: string): unknown[] {
  return text
    .split('\n\n')
    .filter(Boolean)
    .map(event => JSON.parse(event.slice('data: '.length)));
}

const question = { messages: [{ role: 'user', content: 'Hi' }] };

describe('/api/workspaces/:workspaceId/projects/:projectId/chat', () => {
  let app: TestingApp;

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
    workspaceId: string;
    projectId: string;
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
    const base = `${WORKSPACES_PATH}/${workspace.body.id}/projects/${project.body.id}`;

    return {
      ada,
      bob,
      workspaceId: workspace.body.id,
      projectId: project.body.id,
      path: `${base}/chat`,
    };
  }

  describe('with a model', () => {
    beforeAll(async () => {
      app = await createApp({ agentModel: scriptedModel });
    });

    afterEach(async () => {
      turns = [];
      await app.clearDatabase();
    });

    afterAll(() => app?.close());

    it('streams the answer as server-sent events', async () => {
      // Arrange
      const { ada, path } = await setUp();
      turns = [answer('Hello, Ada.')];

      // Act
      const response = await app
        .request()
        .post(path)
        .set('Authorization', ada)
        .send(question);

      // Assert
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.headers['content-type']).toMatch(/^text\/event-stream/);
      expect(response.headers['cache-control']).toBe('no-cache');
      expect(readEvents(response.text)).toEqual([
        { type: 'text-delta', text: 'Hello, Ada.' },
        { type: 'finish', finishReason: 'stop' },
      ]);
    });

    it('records a Draft through a tool for a Maintainer', async () => {
      // Arrange
      const { ada, path, projectId } = await setUp();
      turns = [
        toolCall('record_requirement', {
          projectId,
          title: 'PDF export',
          rationale: 'Ada: "customers print reports"',
          fields: { statement: 'Export a report to PDF' },
        }),
        answer('Recorded REQ-1; it awaits approval.'),
      ];

      // Act
      const response = await app
        .request()
        .post(path)
        .set('Authorization', ada)
        .send({
          messages: [{ role: 'user', content: 'We need PDF export' }],
        });

      // Assert
      const events = readEvents(response.text);
      expect(events[0]).toMatchObject({
        type: 'tool-call',
        toolName: 'record_requirement',
      });
      expect(events[1]).toMatchObject({
        type: 'tool-result',
        toolName: 'record_requirement',
        isError: false,
        result: { key: 'REQ-1', status: 'draft', source: 'external-agent' },
      });
      expect(events.at(-1)).toEqual({ type: 'finish', finishReason: 'stop' });
    });

    it('hands a refused tool call back to the model for a Viewer', async () => {
      // Arrange
      const { bob, path, projectId } = await setUp();
      turns = [
        toolCall('record_requirement', {
          projectId,
          title: 'PDF export',
          rationale: 'Bob: "customers print reports"',
          fields: { statement: 'Export a report to PDF' },
        }),
        answer('A Contributor can record that.'),
      ];

      // Act
      const response = await app
        .request()
        .post(path)
        .set('Authorization', bob)
        .send(question);

      // Assert
      const events = readEvents(response.text);
      expect(events[1]).toMatchObject({
        type: 'tool-result',
        isError: true,
        result: expect.stringMatching(/^KNOWLEDGE_RECORDING_FORBIDDEN: /),
      });
      expect(events.slice(2)).toEqual([
        { type: 'text-delta', text: 'A Contributor can record that.' },
        { type: 'finish', finishReason: 'stop' },
      ]);
    });

    it('ends with an error event when the model fails', async () => {
      // Arrange
      const { ada, path } = await setUp();
      turns = [[{ type: 'error', error: new Error('Upstream is down') }]];

      // Act
      const response = await app
        .request()
        .post(path)
        .set('Authorization', ada)
        .send(question);

      // Assert
      expect(readEvents(response.text).at(-1)).toEqual({
        type: 'error',
        code: 'AGENT_FAILED',
        message: expect.any(String),
      });
    });

    it('requires an access token', async () => {
      // Arrange
      const { path } = await setUp();

      // Act
      const response = await app.request().post(path).send(question);

      // Assert
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(response.body.code).toBe('UNAUTHENTICATED');
    });

    it('hides the Workspace from an outsider', async () => {
      // Arrange
      const { path } = await setUp();
      const eve = await signIn('eve@example.com');

      // Act
      const response = await app
        .request()
        .post(path)
        .set('Authorization', eve)
        .send(question);

      // Assert
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.code).toBe('WORKSPACE_NOT_FOUND');
    });

    it('does not find a Project of another Workspace', async () => {
      // Arrange
      const { ada, workspaceId } = await setUp();
      const eve = await signIn('eve@example.com');
      const workspace = await app
        .request()
        .post(WORKSPACES_PATH)
        .set('Authorization', eve)
        .send({ name: 'Eve', slug: 'eve' })
        .expect(HttpStatus.CREATED);
      const project = await app
        .request()
        .post(`${WORKSPACES_PATH}/${workspace.body.id}/projects`)
        .set('Authorization', eve)
        .send({ name: 'Secret', slug: 'secret' })
        .expect(HttpStatus.CREATED);

      // Act
      const response = await app
        .request()
        .post(
          `${WORKSPACES_PATH}/${workspaceId}/projects/${project.body.id}/chat`,
        )
        .set('Authorization', ada)
        .send(question);

      // Assert
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.code).toBe('PROJECT_NOT_FOUND');
    });

    it("rejects a Conversation that does not end with the Member's message", async () => {
      // Arrange
      const { ada, path } = await setUp();

      // Act
      const response = await app
        .request()
        .post(path)
        .set('Authorization', ada)
        .send({
          messages: [
            { role: 'user', content: 'Hi' },
            { role: 'assistant', content: 'Hello' },
          ],
        });

      // Assert
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('without a model', () => {
    beforeAll(async () => {
      app = await createApp({ agentModel: null });
    });

    afterEach(() => app.clearDatabase());

    afterAll(() => app?.close());

    it('answers that Agents are not configured', async () => {
      // Arrange
      const { ada, path } = await setUp();

      // Act
      const response = await app
        .request()
        .post(path)
        .set('Authorization', ada)
        .send(question);

      // Assert
      expect(response.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      expect(response.body).toEqual({
        message: 'Agents are not configured on this server',
        code: 'AGENT_NOT_CONFIGURED',
        status: HttpStatus.SERVICE_UNAVAILABLE,
        retryable: false,
      });
    });
  });
});
