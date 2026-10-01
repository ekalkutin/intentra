import { randomUUID } from 'node:crypto';

import { HttpStatus } from '@nestjs/common';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  AGENTS_IN_USE_CHUNK_TYPE,
  WorkspaceApi,
} from '@intentra/contracts/workspace';
import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceModule } from '@intentra/workspace';

import { restoreAccount, signUp } from './support/sign-up.js';

const SIGN_IN_PATH = '/api/iam/auth/sign-in';
const WORKSPACES_PATH = '/api/workspaces';

const usage = { inputTokens: 1, outputTokens: 1, totalTokens: 2 };

type StreamPart = { readonly type: string } & Record<string, unknown>;

/** What the stand-in model streams, one list per answering step. */
let turns: StreamPart[][] = [];

/** The tools the stand-in model was offered, one list per answering step. */
let offeredTools: string[][] = [];

/** Holds the next step back until released, to keep an answer running. */
let gate: Promise<void> | null = null;

/** The title the stand-in suggests for a new Conversation. */
const TITLE = 'PDF export';

/** Holds the title back until released. */
let titleGate: Promise<void> | null = null;

function streamOf(parts: readonly StreamPart[]) {
  return {
    stream: new ReadableStream({
      async start(controller) {
        await gate;
        for (const part of parts) controller.enqueue(part);
        controller.close();
      },
    }),
  };
}

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

/** A stand-in for the LLM: each answering step streams the next of `turns`; a title is `TITLE`. */
const scriptedModel = {
  specificationVersion: 'v2',
  provider: 'test',
  modelId: 'scripted',
  supportedUrls: {},
  // Mastra asks for a title this way.
  doGenerate: async () => {
    await titleGate;
    return {
      content: [{ type: 'text' as const, text: TITLE }],
      finishReason: 'stop' as const,
      usage,
      warnings: [],
    };
  },
  doStream: async ({ tools }: { tools?: readonly { name: string }[] }) => {
    offeredTools.push((tools ?? []).map(tool => tool.name));

    return streamOf(turns.shift() ?? answer('…'));
  },
} as const;

/** The chunks of an AI SDK UI message stream. */
function readChunks(text: string): StreamPart[] {
  return text
    .split('\n\n')
    .map(event => event.replace(/^data: /, ''))
    .filter(data => data && data !== '[DONE]')
    .map(data => JSON.parse(data));
}

function message(text: string) {
  return {
    message: {
      role: 'user' as const,
      parts: [{ type: 'text' as const, text }],
    },
  };
}

/** Encrypts the Provider Keys in these tests. */
const ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');

const requirement = {
  title: 'PDF export',
  rationale: 'Ada: "customers print reports"',
  fields: { statement: 'Export a report to PDF' },
};

/** The Platform Admin who publishes the Agents. */
const PLATFORM_ADMIN = {
  email: 'admin@example.com',
  name: 'Grace Hopper',
  password: 'correct-horse-battery-staple',
};

const AGENTS_PATH = '/api/platform/agents';

/** Agents run on the stand-in model, whatever their Model Profile and the Provider Key. */
function createApp() {
  return TestingApp.create({
    imports: [
      GatewayModule.register({
        contexts: [
          IamModule.register({
            accessTokenSecret: 'test-access-secret',
            refreshTokenSecret: 'test-refresh-secret',
            accessTokenTtlSeconds: 900,
            refreshTokenTtlSeconds: 604800,
            platformAdmin: PLATFORM_ADMIN,
          }),
          WorkspaceModule.register({
            agents: {
              model: () => scriptedModel,
              providerKeyEncryptionKey: ENCRYPTION_KEY,
            },
          }),
        ],
      }),
    ],
  });
}

describe('/api/workspaces/:workspaceId/projects/:projectId/conversations', () => {
  let app: TestingApp;
  /** The Platform Admin's; an access token keeps working after its Account is cleared away. */
  let admin: string;

  /** An Orchestrator with every tool, on one Model Profile, published as Agents Version 1. */
  async function publishAgents(): Promise<void> {
    const tools = await app
      .request()
      .get(`${AGENTS_PATH}/tools`)
      .set('Authorization', admin)
      .expect(HttpStatus.OK);
    const profile = await app
      .request()
      .post(`${AGENTS_PATH}/unpublished/model-profiles`)
      .set('Authorization', admin)
      .send({ name: 'Default', modelId: 'openrouter/test/scripted' })
      .expect(HttpStatus.CREATED);
    await app
      .request()
      .post(`${AGENTS_PATH}/unpublished/agents`)
      .set('Authorization', admin)
      .send({
        role: 'orchestrator',
        name: 'Orchestrator',
        description: 'Interviews a person',
        instructions: 'Interview the person.',
        tools: tools.body.map((tool: { id: string }) => tool.id),
        skillIds: [],
        modelProfileId: profile.body.id,
      })
      .expect(HttpStatus.CREATED);
    await app
      .request()
      .post(`${AGENTS_PATH}/versions`)
      .set('Authorization', admin)
      .send({})
      .expect(HttpStatus.CREATED);
  }

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

  type Setup = {
    ada: string;
    bob: string;
    workspaceId: string;
    projectId: string;
    base: string;
  };

  /** Ada adds a Provider Key, which OpenRouter accepts. */
  async function addProviderKey(ada: string, workspaceId: string) {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: HttpStatus.OK }));
    await app
      .request()
      .put(`${WORKSPACES_PATH}/${workspaceId}/provider-key`)
      .set('Authorization', ada)
      .send({ key: 'sk-or-v1-0123456789abcdef' })
      .expect(HttpStatus.OK);
    fetch.mockRestore();
  }

  /**
   * Ada owns the Workspace and the Project and has added a Provider Key; Bob
   * joined by Invitation and is a Viewer. The Agents are published unless
   * told otherwise.
   */
  async function setUp({ publish = true } = {}): Promise<Setup> {
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

    await addProviderKey(ada, workspace.body.id);
    if (publish) {
      await publishAgents();
    }

    return {
      ada,
      bob,
      workspaceId: workspace.body.id,
      projectId: project.body.id,
      base: `${WORKSPACES_PATH}/${workspace.body.id}/projects/${project.body.id}`,
    };
  }

  beforeAll(async () => {
    app = await createApp();
    const signedIn = await app
      .request()
      .post(SIGN_IN_PATH)
      .send(PLATFORM_ADMIN)
      .expect(HttpStatus.OK);
    admin = `Bearer ${signedIn.body.accessToken}`;
  });

  afterEach(async () => {
    turns = [];
    offeredTools = [];
    gate = null;
    titleGate = null;
    await app.clearDatabase();
  });

  afterAll(() => app?.close());

  it('starts a Conversation with its first message and streams the answer', async () => {
    // Arrange
    const { ada, base } = await setUp();
    const id = randomUUID();
    turns = [answer('Hello, Ada.')];

    // Act
    const response = await app
      .request()
      .post(`${base}/conversations/${id}/messages`)
      .set('Authorization', ada)
      .send(message('Hi'));

    // Assert
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.headers['content-type']).toMatch(/^text\/event-stream/);
    expect(readChunks(response.text)).toContainEqual(
      expect.objectContaining({ type: 'text-delta', delta: 'Hello, Ada.' }),
    );
  });

  it('keeps the messages and a suggested title', async () => {
    // Arrange
    const { ada, base } = await setUp();
    const id = randomUUID();
    turns = [answer('Hello, Ada.')];
    await app
      .request()
      .post(`${base}/conversations/${id}/messages`)
      .set('Authorization', ada)
      .send(message('Hi'))
      .expect(HttpStatus.OK);

    // Act
    const { body: conversation } = await app
      .request()
      .get(`${base}/conversations/${id}`)
      .set('Authorization', ada)
      .expect(HttpStatus.OK);

    // Assert
    expect(conversation).toMatchObject({ id, title: TITLE, hidden: false });
    expect(conversation.messages).toMatchObject([
      { role: 'user', parts: [{ type: 'text', text: 'Hi' }] },
      {
        role: 'assistant',
        parts: expect.arrayContaining([
          expect.objectContaining({ type: 'text', text: 'Hello, Ada.' }),
        ]),
      },
    ]);
  });

  it('keeps when it started once the title comes', async () => {
    // Arrange
    const { ada, base } = await setUp();
    const id = randomUUID();
    let release = (): void => undefined;
    titleGate = new Promise(resolve => {
      release = resolve;
    });
    turns = [answer('Hello, Ada.')];
    // The answer waits for its title, held back here.
    const answering = app
      .request()
      .post(`${base}/conversations/${id}/messages`)
      .set('Authorization', ada)
      .send(message('Hi'))
      .then(response => response);
    const untitled = await vi.waitFor(async () => {
      const response = await app
        .request()
        .get(`${base}/conversations/${id}`)
        .set('Authorization', ada)
        .expect(HttpStatus.OK);
      return response.body;
    });

    // Act
    release();
    await answering;

    // Assert
    const { body: titled } = await app
      .request()
      .get(`${base}/conversations/${id}`)
      .set('Authorization', ada)
      .expect(HttpStatus.OK);
    expect(untitled.title).toBeNull();
    expect(titled.title).toBe(TITLE);
    expect(titled.createdAt).toBe(untitled.createdAt);
  });

  it('streams the suggested title before the answer ends', async () => {
    // Arrange
    const { ada, base } = await setUp();
    const id = randomUUID();
    turns = [answer('Hello, Ada.')];

    // Act
    const response = await app
      .request()
      .post(`${base}/conversations/${id}/messages`)
      .set('Authorization', ada)
      .send(message('Hi'));

    // Assert
    const chunks = readChunks(response.text);
    const title = chunks.findIndex(({ type }) => type === 'data-thread-title');
    expect(chunks[title]).toMatchObject({
      data: { threadId: id, title: TITLE },
    });
    expect(title).toBeLessThan(
      chunks.findIndex(({ type }) => type === 'finish'),
    );
  });

  it("lists a Member's Conversations, the hidden ones apart", async () => {
    // Arrange
    const { ada, bob, base } = await setUp();
    const [shownId, hiddenId] = [randomUUID(), randomUUID()];
    for (const id of [shownId, hiddenId]) {
      await app
        .request()
        .post(`${base}/conversations/${id}/messages`)
        .set('Authorization', ada)
        .send(message('Hi'))
        .expect(HttpStatus.OK);
    }
    await app
      .request()
      .patch(`${base}/conversations/${hiddenId}`)
      .set('Authorization', ada)
      .send({ hidden: true })
      .expect(HttpStatus.OK);

    // Act
    const [shown, hidden, bobs] = await Promise.all([
      app.request().get(`${base}/conversations`).set('Authorization', ada),
      app
        .request()
        .get(`${base}/conversations?hidden=true`)
        .set('Authorization', ada),
      app.request().get(`${base}/conversations`).set('Authorization', bob),
    ]);

    // Assert
    expect(shown.body).toMatchObject({
      items: [{ id: shownId, title: TITLE, hidden: false }],
      total: 1,
    });
    expect(hidden.body).toMatchObject({
      items: [{ id: hiddenId, hidden: true }],
      total: 1,
    });
    expect(bobs.body).toEqual({ items: [], total: 0 });
  });

  it('shows a hidden Conversation again once the Member writes in it', async () => {
    // Arrange
    const { ada, base } = await setUp();
    const id = randomUUID();
    await app
      .request()
      .post(`${base}/conversations/${id}/messages`)
      .set('Authorization', ada)
      .send(message('Hi'))
      .expect(HttpStatus.OK);
    await app
      .request()
      .patch(`${base}/conversations/${id}`)
      .set('Authorization', ada)
      .send({ hidden: true })
      .expect(HttpStatus.OK);

    // Act
    await app
      .request()
      .post(`${base}/conversations/${id}/messages`)
      .set('Authorization', ada)
      .send(message('Back again'))
      .expect(HttpStatus.OK);

    // Assert
    const { body } = await app
      .request()
      .get(`${base}/conversations`)
      .set('Authorization', ada)
      .expect(HttpStatus.OK);
    expect(body.items).toMatchObject([{ id, hidden: false }]);
  });

  it('takes the title the Member gives', async () => {
    // Arrange
    const { ada, base } = await setUp();
    const id = randomUUID();
    await app
      .request()
      .post(`${base}/conversations/${id}/messages`)
      .set('Authorization', ada)
      .send(message('Hi'))
      .expect(HttpStatus.OK);

    // Act
    const response = await app
      .request()
      .patch(`${base}/conversations/${id}`)
      .set('Authorization', ada)
      .send({ title: ' Invoices ' });

    // Assert
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject({ id, title: 'Invoices' });
    const { body } = await app
      .request()
      .get(`${base}/conversations/${id}`)
      .set('Authorization', ada)
      .expect(HttpStatus.OK);
    expect(body.title).toBe('Invoices');
  });

  it('refuses an edit that changes nothing', async () => {
    // Arrange
    const { ada, base } = await setUp();

    // Act
    const response = await app
      .request()
      .patch(`${base}/conversations/${randomUUID()}`)
      .set('Authorization', ada)
      .send({});

    // Assert
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.code).toBe('VALIDATION_FAILED');
  });

  it('deletes a Conversation with its messages, and only its Member may', async () => {
    // Arrange
    const { ada, bob, base } = await setUp();
    const id = randomUUID();
    await app
      .request()
      .post(`${base}/conversations/${id}/messages`)
      .set('Authorization', ada)
      .send(message('Hi'))
      .expect(HttpStatus.OK);
    const bobs = await app
      .request()
      .delete(`${base}/conversations/${id}`)
      .set('Authorization', bob);

    // Act
    const response = await app
      .request()
      .delete(`${base}/conversations/${id}`)
      .set('Authorization', ada);

    // Assert
    expect(bobs.status).toBe(HttpStatus.NOT_FOUND);
    expect(response.status).toBe(HttpStatus.NO_CONTENT);
    const reading = await app
      .request()
      .get(`${base}/conversations/${id}`)
      .set('Authorization', ada);
    expect(reading.status).toBe(HttpStatus.NOT_FOUND);
    expect(reading.body.code).toBe('CONVERSATION_NOT_FOUND');
  });

  it('records a Draft with the Source intentra-agent', async () => {
    // Arrange
    const { ada, base, projectId } = await setUp();
    turns = [
      toolCall('record_requirement', { projectId, ...requirement }),
      answer('Recorded REQ-1; it awaits approval.'),
    ];

    // Act
    const response = await app
      .request()
      .post(`${base}/conversations/${randomUUID()}/messages`)
      .set('Authorization', ada)
      .send(message('We need PDF export'));

    // Assert
    expect(readChunks(response.text)).toContainEqual(
      expect.objectContaining({
        type: 'tool-output-available',
        output: expect.objectContaining({
          key: 'REQ-1',
          status: 'draft',
          source: 'intentra-agent',
        }),
      }),
    );
    const knowledge = await app
      .request()
      .get(`${base}/knowledge/REQ-1`)
      .set('Authorization', ada)
      .expect(HttpStatus.OK);
    expect(knowledge.body).toMatchObject({ source: 'intentra-agent' });
  });

  it('offers a Viewer only the tools that read', async () => {
    // Arrange
    const { bob, base } = await setUp();
    turns = [answer('A Contributor can record that.')];

    // Act
    const response = await app
      .request()
      .post(`${base}/conversations/${randomUUID()}/messages`)
      .set('Authorization', bob)
      .send(message('We need PDF export'));

    // Assert
    expect(response.status).toBe(HttpStatus.OK);
    expect(offeredTools[0]).toContain('list_knowledge');
    expect(offeredTools[0]).not.toContain('record_requirement');
    expect(offeredTools[0]).not.toContain('delete_knowledge_draft');
  });

  it("works in no Project but the Conversation's", async () => {
    // Arrange
    const { ada, base, workspaceId } = await setUp();
    const payroll = await app
      .request()
      .post(`${WORKSPACES_PATH}/${workspaceId}/projects`)
      .set('Authorization', ada)
      .send({ name: 'Payroll', slug: 'payroll' })
      .expect(HttpStatus.CREATED);
    turns = [
      toolCall('record_requirement', {
        projectId: payroll.body.id,
        ...requirement,
      }),
      answer('I cannot reach that Project.'),
    ];

    // Act
    const response = await app
      .request()
      .post(`${base}/conversations/${randomUUID()}/messages`)
      .set('Authorization', ada)
      .send(message('Record it in Payroll'));

    // Assert
    expect(readChunks(response.text)).toContainEqual(
      expect.objectContaining({
        type: 'tool-output-error',
        errorText: expect.stringMatching(/^PROJECT_NOT_FOUND: /),
      }),
    );
    const knowledge = await app
      .request()
      .get(
        `${WORKSPACES_PATH}/${workspaceId}/projects/${payroll.body.id}/knowledge`,
      )
      .set('Authorization', ada)
      .expect(HttpStatus.OK);
    expect(knowledge.body.total).toBe(0);
  });

  it("hides a Member's Conversation from everyone else", async () => {
    // Arrange
    const { ada, bob, base } = await setUp();
    const id = randomUUID();
    turns = [answer('Hello, Ada.')];
    await app
      .request()
      .post(`${base}/conversations/${id}/messages`)
      .set('Authorization', ada)
      .send(message('Hi'))
      .expect(HttpStatus.OK);

    // Act
    const [reading, writing] = await Promise.all([
      app
        .request()
        .get(`${base}/conversations/${id}`)
        .set('Authorization', bob),
      app
        .request()
        .post(`${base}/conversations/${id}/messages`)
        .set('Authorization', bob)
        .send(message('Hi')),
    ]);

    // Assert
    for (const response of [reading, writing]) {
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.code).toBe('CONVERSATION_NOT_FOUND');
    }
  });

  it('refuses another message while an answer runs', async () => {
    // Arrange
    const { ada, base } = await setUp();
    const path = `${base}/conversations/${randomUUID()}/messages`;
    let release = (): void => undefined;
    gate = new Promise(resolve => {
      release = resolve;
    });
    turns = [answer('Hello, Ada.')];
    const first = app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send(message('Hi'))
      .then(response => response);
    await vi.waitFor(() => expect(turns).toHaveLength(0));

    // Act
    const second = await app
      .request()
      .post(path)
      .set('Authorization', ada)
      .send(message('Are you there?'));

    // Assert
    release();
    expect(second.status).toBe(HttpStatus.CONFLICT);
    expect(second.body.code).toBe('CONVERSATION_BUSY');
    expect((await first).status).toBe(HttpStatus.OK);
  });

  it('refuses to edit or delete a Conversation while an answer runs', async () => {
    // Arrange
    const { ada, base } = await setUp();
    const id = randomUUID();
    await app
      .request()
      .post(`${base}/conversations/${id}/messages`)
      .set('Authorization', ada)
      .send(message('Hi'))
      .expect(HttpStatus.OK);
    let release = (): void => undefined;
    gate = new Promise(resolve => {
      release = resolve;
    });
    turns = [answer('Still here.')];
    const running = app
      .request()
      .post(`${base}/conversations/${id}/messages`)
      .set('Authorization', ada)
      .send(message('Are you there?'))
      .then(response => response);
    await vi.waitFor(() => expect(turns).toHaveLength(0));

    // Act
    const [editing, deleting] = await Promise.all([
      app
        .request()
        .patch(`${base}/conversations/${id}`)
        .set('Authorization', ada)
        .send({ hidden: true }),
      app
        .request()
        .delete(`${base}/conversations/${id}`)
        .set('Authorization', ada),
    ]);

    // Assert
    release();
    for (const response of [editing, deleting]) {
      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(response.body.code).toBe('CONVERSATION_BUSY');
    }
    expect((await running).status).toBe(HttpStatus.OK);
  });

  it('runs the answer to the end when nobody reads it', async () => {
    // Arrange
    const { ada, base, workspaceId, projectId } = await setUp();
    const id = randomUUID();
    turns = [answer('Hello, Ada.')];
    const me = await app
      .request()
      .get('/api/iam/me')
      .set('Authorization', ada)
      .expect(HttpStatus.OK);
    const stream = await app
      .get(WorkspaceApi)
      .conversations.send(me.body, workspaceId, projectId, id, message('Hi'));

    // Act
    await stream.cancel();

    // Assert
    await vi.waitFor(async () => {
      const response = await app
        .request()
        .get(`${base}/conversations/${id}`)
        .set('Authorization', ada)
        .expect(HttpStatus.OK);
      expect(response.body.messages).toContainEqual(
        expect.objectContaining({ role: 'assistant' }),
      );
    });
  });

  it('rejects a message that is too long', async () => {
    // Arrange
    const { ada, base } = await setUp();

    // Act
    const response = await app
      .request()
      .post(`${base}/conversations/${randomUUID()}/messages`)
      .set('Authorization', ada)
      .send(message('x'.repeat(20_001)));

    // Assert
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.code).toBe('VALIDATION_FAILED');
  });

  it('hides the Workspace from an outsider', async () => {
    // Arrange
    const { base } = await setUp();
    const eve = await signIn('eve@example.com');

    // Act
    const response = await app
      .request()
      .post(`${base}/conversations/${randomUUID()}/messages`)
      .set('Authorization', eve)
      .send(message('Hi'));

    // Assert
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(response.body.code).toBe('WORKSPACE_NOT_FOUND');
  });

  it('asks for a Provider Key once an Owner has removed it', async () => {
    // Arrange
    const { ada, workspaceId, base } = await setUp();
    await app
      .request()
      .delete(`${WORKSPACES_PATH}/${workspaceId}/provider-key`)
      .set('Authorization', ada)
      .expect(HttpStatus.NO_CONTENT);

    // Act
    const response = await app
      .request()
      .post(`${base}/conversations/${randomUUID()}/messages`)
      .set('Authorization', ada)
      .send(message('Hi'));

    // Assert
    expect(response.status).toBe(HttpStatus.PRECONDITION_FAILED);
    expect(response.body).toEqual({
      message:
        'Agents need a provider key; an owner of the workspace can add one',
      code: 'PROVIDER_KEY_MISSING',
      status: HttpStatus.PRECONDITION_FAILED,
      retryable: false,
    });
  });

  describe('which Agents answer', () => {
    /** A Workspace and Project of the Platform Admin's own, with a Provider Key. */
    async function adminProject(): Promise<string> {
      await restoreAccount(app, admin);
      const workspace = await app
        .request()
        .post(WORKSPACES_PATH)
        .set('Authorization', admin)
        .send({ name: 'Intentra', slug: 'intentra' })
        .expect(HttpStatus.CREATED);
      const project = await app
        .request()
        .post(`${WORKSPACES_PATH}/${workspace.body.id}/projects`)
        .set('Authorization', admin)
        .send({ name: 'Trials', slug: 'trials' })
        .expect(HttpStatus.CREATED);
      await addProviderKey(admin, workspace.body.id);

      return `${WORKSPACES_PATH}/${workspace.body.id}/projects/${project.body.id}`;
    }

    it('tells a Member that the Published Agents answer', async () => {
      // Arrange
      const { ada, base } = await setUp();
      turns = [answer('Hello, Ada.')];

      // Act
      const response = await app
        .request()
        .post(`${base}/conversations/${randomUUID()}/messages`)
        .set('Authorization', ada)
        .send(message('Hi'));

      // Assert
      expect(readChunks(response.text)[0]).toEqual({
        type: AGENTS_IN_USE_CHUNK_TYPE,
        data: { versionNumber: 1 },
        transient: true,
      });
    });

    it('refuses while no Agents are published', async () => {
      // Arrange
      const { ada, base } = await setUp({ publish: false });

      // Act
      const response = await app
        .request()
        .post(`${base}/conversations/${randomUUID()}/messages`)
        .set('Authorization', ada)
        .send(message('Hi'));

      // Assert
      expect(response.status).toBe(HttpStatus.PRECONDITION_FAILED);
      expect(response.body.code).toBe('AGENTS_NOT_PUBLISHED');
    });

    it("runs the Unpublished Agents in a Platform Admin's own Conversation", async () => {
      // Arrange
      await setUp();
      const base = await adminProject();
      turns = [answer('Hello.')];

      // Act
      const response = await app
        .request()
        .post(`${base}/conversations/${randomUUID()}/messages`)
        .set('Authorization', admin)
        .send(message('Hi'));

      // Assert
      expect(readChunks(response.text)[0]).toMatchObject({
        type: AGENTS_IN_USE_CHUNK_TYPE,
        data: { versionNumber: null },
      });
    });

    it('tells a Platform Admin why the Unpublished Agents cannot run', async () => {
      // Arrange
      await setUp({ publish: false });
      const base = await adminProject();

      // Act
      const response = await app
        .request()
        .post(`${base}/conversations/${randomUUID()}/messages`)
        .set('Authorization', admin)
        .send(message('Hi'));

      // Assert
      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(response.body).toMatchObject({
        code: 'AGENTS_NOT_PUBLISHABLE',
        message: expect.stringContaining('exactly one Orchestrator'),
      });
    });
  });
});
