import { HttpStatus } from '@nestjs/common';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceModule } from '@intentra/workspace';

import { signUp } from './support/sign-up.js';
import { setOpenWorkspaceCreation } from './support/workspace-creation.js';

const SIGN_IN_PATH = '/api/iam/auth/sign-in';
const WORKSPACES_PATH = '/api/workspaces';
const AGENTS_PATH = '/api/platform/agents';

const usage = { inputTokens: 1, outputTokens: 1, totalTokens: 2 };

type StreamPart = { readonly type: string } & Record<string, unknown>;

/** What the stand-in model answers, one list per step. */
let turns: StreamPart[][] = [];

/** Holds the next step back until released, to keep a run running. */
let gate: Promise<void> | null = null;

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
      toolCallId: `call-${toolName}`,
      toolName,
      input: JSON.stringify(input),
    },
    { type: 'finish', finishReason: 'tool-calls', usage },
  ];
}

type GeneratedContent =
  | { readonly type: 'text'; readonly text: string }
  | {
      readonly type: 'tool-call';
      readonly toolCallId: string;
      readonly toolName: string;
      readonly input: string;
    };

/** A stand-in for the LLM: each step answers with the next of `turns`. */
const scriptedModel = {
  specificationVersion: 'v2',
  provider: 'test',
  modelId: 'scripted',
  supportedUrls: {},
  // The Auditor runs with `generate`, which asks for each step whole.
  doGenerate: async () => {
    await gate;
    const parts = turns.shift() ?? answer('Nothing more.');
    const finish = parts.find(part => part.type === 'finish');

    return {
      content: parts.flatMap((part): GeneratedContent[] => {
        if (part.type === 'text-delta') {
          return [{ type: 'text', text: String(part.delta) }];
        }
        if (part.type === 'tool-call') {
          return [
            {
              type: 'tool-call',
              toolCallId: String(part.toolCallId),
              toolName: String(part.toolName),
              input: String(part.input),
            },
          ];
        }
        return [];
      }),
      finishReason: (finish?.finishReason ?? 'stop') as 'stop' | 'tool-calls',
      usage,
      warnings: [],
    };
  },
  doStream: async () => {
    throw new Error('The Auditor generates');
  },
} as const;

/** A stand-in that always fails, as a provider refusing the key would. */
let failing = false;

const ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');

const PLATFORM_ADMIN = {
  email: 'admin@example.com',
  name: 'Grace Hopper',
  password: 'correct-horse-battery-staple',
};

const question = {
  title: 'Export format',
  rationale: 'REQ-1 says PDF, BR-1 says CSV',
  fields: { question: 'Which format does an export use?' },
};

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
              model: () => {
                if (failing) {
                  throw new Error('The provider refused the key');
                }

                return scriptedModel;
              },
              providerKeyEncryptionKey: ENCRYPTION_KEY,
            },
          }),
        ],
      }),
    ],
  });
}

describe('/api/workspaces/:workspaceId/projects/:projectId/analysis-runs', () => {
  let app: TestingApp;
  let admin: string;

  /** Intentra and the Auditor with every tool, published as Agents Version 1. */
  async function publishAgents(): Promise<void> {
    const tools = await app
      .request()
      .get(`${AGENTS_PATH}/tools`)
      .set('Authorization', admin)
      .expect(HttpStatus.OK);
    const toolIds = tools.body.map((tool: { id: string }) => tool.id);
    const profile = await app
      .request()
      .post(`${AGENTS_PATH}/unpublished/model-profiles`)
      .set('Authorization', admin)
      .send({ name: 'Default', modelId: 'openrouter/test/scripted' })
      .expect(HttpStatus.CREATED);
    for (const role of ['intentra', 'auditor']) {
      await app
        .request()
        .post(`${AGENTS_PATH}/unpublished/agents`)
        .set('Authorization', admin)
        .send({
          role,
          name: role === 'intentra' ? 'Intentra' : 'Auditor',
          description: 'Works with the knowledge',
          instructions: 'Do the work.',
          tools: toolIds,
          skillIds: [],
          modelProfileId: profile.body.id,
        })
        .expect(HttpStatus.CREATED);
    }
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

  type Setup = { ada: string; bob: string; base: string; projectId: string };

  /**
   * Ada owns the Workspace and the Project; Bob joined by Invitation and is
   * a Viewer. A Provider Key and the Agents are there unless told otherwise.
   */
  async function setUp({
    providerKey = true,
    publish = true,
  } = {}): Promise<Setup> {
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
    if (providerKey) {
      await addProviderKey(ada, workspace.body.id);
    }
    if (publish) {
      await publishAgents();
    }

    return {
      ada,
      bob,
      projectId: project.body.id,
      base: `${WORKSPACES_PATH}/${workspace.body.id}/projects/${project.body.id}`,
    };
  }

  /** The run once it is no longer running. */
  async function finished(
    base: string,
    token: string,
    runId: string,
  ): Promise<Record<string, unknown>> {
    for (let attempt = 0; attempt < 100; attempt++) {
      const response = await app
        .request()
        .get(`${base}/analysis-runs/${runId}`)
        .set('Authorization', token)
        .expect(HttpStatus.OK);
      if (response.body.status !== 'running') {
        return response.body;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    throw new Error('The Analysis Run is still running');
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

  beforeEach(() => setOpenWorkspaceCreation(app, true));

  afterEach(async () => {
    turns = [];
    gate = null;
    failing = false;
    await app.clearDatabase();
  });

  afterAll(() => app?.close());

  it('runs the Auditor in the background and keeps the Open Questions it recorded as Intentra', async () => {
    // Arrange
    const { ada, base, projectId } = await setUp();
    turns = [
      toolCall('list_knowledge', { projectId }),
      toolCall('record_open_question', { projectId, ...question }),
      answer('One contradiction found.'),
    ];

    // Act
    const started = await app
      .request()
      .post(`${base}/analysis-runs`)
      .set('Authorization', ada);
    const run = await finished(base, ada, started.body.id);

    // Assert
    expect(started.status).toBe(HttpStatus.CREATED);
    expect(started.body).toMatchObject({
      status: 'running',
      scope: 'whole-project',
      startedBy: expect.any(String),
      finishedAt: null,
    });
    expect(run).toMatchObject({
      status: 'completed',
      agentsVersion: 1,
      questionKeys: ['TBD-1'],
      stepLimitReached: false,
      failure: null,
      finishedAt: expect.any(String),
    });
    const recorded = await app
      .request()
      .get(`${base}/knowledge/TBD-1`)
      .set('Authorization', ada)
      .expect(HttpStatus.OK);
    expect(recorded.body).toMatchObject({
      status: 'draft',
      source: 'analysis-run',
      authorId: null,
      rationale: question.rationale,
    });
  });

  it('records nothing but Open Questions, whatever the Auditor tries', async () => {
    // Arrange
    const { ada, base, projectId } = await setUp();
    turns = [
      toolCall('record_requirement', {
        projectId,
        title: 'CSV export',
        rationale: 'The Auditor thinks so',
        fields: { statement: 'Export to CSV' },
      }),
      answer('Done.'),
    ];

    // Act
    const started = await app
      .request()
      .post(`${base}/analysis-runs`)
      .set('Authorization', ada);
    const run = await finished(base, ada, started.body.id);

    // Assert
    expect(run).toMatchObject({ status: 'completed', questionKeys: [] });
    const knowledge = await app
      .request()
      .get(`${base}/knowledge`)
      .query({ statuses: 'draft' })
      .set('Authorization', ada)
      .expect(HttpStatus.OK);
    expect(knowledge.body.total).toBe(0);
  });

  it('runs one at a time in a Project', async () => {
    // Arrange
    const { ada, base } = await setUp();
    let release = () => {};
    gate = new Promise(resolve => (release = resolve));
    const first = await app
      .request()
      .post(`${base}/analysis-runs`)
      .set('Authorization', ada)
      .expect(HttpStatus.CREATED);

    // Act
    const second = await app
      .request()
      .post(`${base}/analysis-runs`)
      .set('Authorization', ada);

    // Assert
    expect(second.status).toBe(HttpStatus.CONFLICT);
    expect(second.body.code).toBe('ANALYSIS_RUN_BUSY');
    release();
    await finished(base, ada, first.body.id);
  });

  it.each([
    [{ providerKey: false }, 'provider-key-missing'],
    [{ publish: false }, 'agents-not-published'],
  ])(
    'keeps a run that cannot start as failed (%o)',
    async (options, failure) => {
      // Arrange
      const { ada, base } = await setUp(options);

      // Act
      const started = await app
        .request()
        .post(`${base}/analysis-runs`)
        .set('Authorization', ada);
      const run = await finished(base, ada, started.body.id);

      // Assert
      expect(run).toMatchObject({
        status: 'failed',
        failure,
        questionKeys: [],
      });
    },
  );

  it('keeps a run whose Auditor fails as failed', async () => {
    // Arrange
    const { ada, base } = await setUp();
    failing = true;

    // Act
    const started = await app
      .request()
      .post(`${base}/analysis-runs`)
      .set('Authorization', ada);
    const run = await finished(base, ada, started.body.id);

    // Assert
    expect(run).toMatchObject({ status: 'failed', failure: 'auditor-failed' });
  });

  it('lets a Viewer read the runs but not start one', async () => {
    // Arrange
    const { ada, bob, base } = await setUp();
    turns = [answer('Nothing found.')];
    const started = await app
      .request()
      .post(`${base}/analysis-runs`)
      .set('Authorization', ada)
      .expect(HttpStatus.CREATED);
    await finished(base, ada, started.body.id);

    // Act
    const starting = await app
      .request()
      .post(`${base}/analysis-runs`)
      .set('Authorization', bob);
    const listing = await app
      .request()
      .get(`${base}/analysis-runs`)
      .set('Authorization', bob);

    // Assert
    expect(starting.status).toBe(HttpStatus.FORBIDDEN);
    expect(starting.body.code).toBe('ANALYSIS_RUN_FORBIDDEN');
    expect(listing.status).toBe(HttpStatus.OK);
    expect(listing.body).toMatchObject({
      total: 1,
      items: [{ id: started.body.id, status: 'completed' }],
      access: { canStart: false },
    });
  });

  it('lets a Maintainer turn the nightly run on and every Member read it', async () => {
    // Arrange
    const { ada, bob, base } = await setUp();

    // Act
    const before = await app
      .request()
      .get(`${base}/analysis-schedule`)
      .set('Authorization', ada);
    const turned = await app
      .request()
      .put(`${base}/analysis-schedule`)
      .set('Authorization', ada)
      .send({ enabled: true });
    const byViewer = await app
      .request()
      .put(`${base}/analysis-schedule`)
      .set('Authorization', bob)
      .send({ enabled: false });
    const readByViewer = await app
      .request()
      .get(`${base}/analysis-schedule`)
      .set('Authorization', bob);

    // Assert
    expect(before.body).toEqual({
      enabled: false,
      changedBy: null,
      changedAt: null,
      blockedBy: null,
      access: { canChange: true },
    });
    expect(turned.status).toBe(HttpStatus.OK);
    expect(turned.body).toMatchObject({
      enabled: true,
      changedBy: expect.any(String),
      changedAt: expect.any(String),
      blockedBy: null,
    });
    expect(byViewer.status).toBe(HttpStatus.FORBIDDEN);
    expect(byViewer.body.code).toBe('ANALYSIS_SCHEDULE_FORBIDDEN');
    expect(readByViewer.body).toMatchObject({
      enabled: true,
      access: { canChange: false },
    });
  });

  it('tells why a nightly run that is on cannot go ahead', async () => {
    // Arrange
    const { ada, base } = await setUp({ publish: false });

    // Act
    const turned = await app
      .request()
      .put(`${base}/analysis-schedule`)
      .set('Authorization', ada)
      .send({ enabled: true });

    // Assert
    expect(turned.body.blockedBy).toBe('agents-not-published');
  });

  it('hides the runs from someone outside the Workspace', async () => {
    // Arrange
    const { base } = await setUp({ providerKey: false, publish: false });
    const eve = await signIn('eve@example.com');

    // Act
    const response = await app
      .request()
      .get(`${base}/analysis-runs`)
      .set('Authorization', eve);

    // Assert
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });
});
