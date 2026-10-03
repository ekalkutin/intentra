import { MockMemory } from '@mastra/core/memory';
import { RequestContext } from '@mastra/core/request-context';
import { MastraLanguageModelV2Mock } from '@mastra/core/test-utils/llm-mock';
import { describe, expect, it, vi } from 'vitest';

import type { ProjectRoleDto } from '@intentra/contracts/workspace';

import type { ToolApis } from '../tool-apis.js';

import type { AgentDefinition } from './agent-definition.js';
import type { IntentraContext } from './intentra-context.js';
import { createIntentra } from './intentra.js';

const usage = { inputTokens: 1, outputTokens: 1, totalTokens: 2 };

type StreamPart = Record<string, unknown> & { readonly type: string };

function streamOf(parts: readonly StreamPart[]) {
  return {
    stream: new ReadableStream({
      start(controller) {
        for (const part of parts) controller.enqueue(part);
        controller.close();
      },
    }),
  };
}

/** A model that records a Goal first, then answers with text. */
function recordingModel(): MastraLanguageModelV2Mock {
  const turns = [
    streamOf([
      {
        type: 'tool-call',
        toolCallId: 'call-1',
        toolName: 'record_goal',
        input: JSON.stringify({
          projectId: 'project-1',
          title: 'Fewer late invoices',
          rationale: 'Ada: "we chase invoices by hand"',
          fields: { outcome: 'Halve late invoices' },
        }),
      },
      { type: 'finish', finishReason: 'tool-calls', usage },
    ]),
    streamOf([
      { type: 'text-start', id: 'text-1' },
      { type: 'text-delta', id: 'text-1', delta: 'Done.' },
      { type: 'text-end', id: 'text-1' },
      { type: 'finish', finishReason: 'stop', usage },
    ]),
  ];
  let turn = 0;

  return new MastraLanguageModelV2Mock({
    doStream: async () => turns[turn++] ?? streamOf([]),
  });
}

function requestContextWith(
  record: () => Promise<never>,
  role: ProjectRoleDto = 'maintainer',
): RequestContext<IntentraContext> {
  const requestContext = new RequestContext<IntentraContext>();
  requestContext.set('apis', {
    knowledge: { record },
  } as unknown as ToolApis);
  requestContext.set('caller', {
    actor: {
      accountId: 'account-1',
      email: 'ada@example.com',
      name: 'Ada',
      isPlatformAdmin: false,
    },
    agent: { kind: 'intentra', level: 'contributor', projectId: 'project-1' },
  });
  requestContext.set('workspaceId', 'workspace-1');
  requestContext.set('project', {
    id: 'project-1',
    name: 'Billing',
    role,
  });

  return requestContext;
}

/** An Agent as published, on `model`, with every tool these tests use. */
function definition(
  model: MastraLanguageModelV2Mock,
  overrides: Partial<AgentDefinition> = {},
): AgentDefinition {
  return {
    name: 'Intentra',
    description: 'Interviews a person',
    instructions: 'Interview the person.',
    toolIds: ['list_knowledge', 'record_goal'],
    skills: [],
    model,
    temperature: null,
    reasoningEffort: null,
    maxOutputTokens: null,
    ...overrides,
  };
}

/** A model that answers with text only. */
function answeringModel(text: string): MastraLanguageModelV2Mock {
  return new MastraLanguageModelV2Mock({
    doStream: async () =>
      streamOf([
        { type: 'text-start', id: 'text-1' },
        { type: 'text-delta', id: 'text-1', delta: text },
        { type: 'text-end', id: 'text-1' },
        { type: 'finish', finishReason: 'stop', usage },
      ]),
  });
}

/** Runs one Conversation turn and gives what the model was sent the second time. */
async function converse(
  record: () => Promise<never>,
  onUnexpectedError = vi.fn(),
) {
  const model = recordingModel();
  const intentra = createIntentra({
    intentra: definition(model),
    specialists: [],
    memory: new MockMemory(),
    onUnexpectedError,
  });
  const output = await intentra.stream(
    [{ role: 'user', content: 'We want fewer late invoices' }],
    { requestContext: requestContextWith(record), maxSteps: 5 },
  );
  await output.consumeStream();

  return { calls: model.doStreamCalls, onUnexpectedError };
}

describe('Intentra', () => {
  it("is told its Project and the Member's Project Role", async () => {
    // Act
    const { calls } = await converse(() => Promise.reject(new Error('x')));

    // Assert
    const system = JSON.stringify(calls[0]?.prompt[0]);
    expect(system).toContain('Billing');
    expect(system).toContain('project-1');
    expect(system).toContain('They are a Maintainer');
  });

  it('marks its instructions for the provider to cache', async () => {
    // Act
    const { calls } = await converse(() => Promise.reject(new Error('x')));

    // Assert
    expect(calls[0]?.prompt[0]).toMatchObject({
      role: 'system',
      providerOptions: {
        openrouter: { cacheControl: { type: 'ephemeral' } },
      },
    });
  });

  it('sees an expected failure with its code', async () => {
    // Arrange
    const failure = Object.assign(new Error('Knowledge item has changed'), {
      code: 'KNOWLEDGE_ITEM_CHANGED',
    });

    // Act
    const { calls, onUnexpectedError } = await converse(() =>
      Promise.reject(failure),
    );

    // Assert
    expect(JSON.stringify(calls[1]?.prompt)).toContain(
      'KNOWLEDGE_ITEM_CHANGED: Knowledge item has changed',
    );
    expect(onUnexpectedError).not.toHaveBeenCalled();
  });

  it('sees an unexpected failure only as INTERNAL', async () => {
    // Arrange
    const failure = new Error('connection to the database lost');

    // Act
    const { calls, onUnexpectedError } = await converse(() =>
      Promise.reject(failure),
    );

    // Assert
    const prompt = JSON.stringify(calls[1]?.prompt);
    expect(prompt).toContain('INTERNAL: Something went wrong on the server');
    expect(prompt).not.toContain('database');
    expect(onUnexpectedError).toHaveBeenCalledWith(failure);
  });

  it('sends past reads to the model no more, but what it did', async () => {
    // Arrange
    const turns = [
      streamOf([
        {
          type: 'tool-call',
          toolCallId: 'call-0',
          toolName: 'list_knowledge',
          input: JSON.stringify({ projectId: 'project-1' }),
        },
        { type: 'finish', finishReason: 'tool-calls', usage },
      ]),
      streamOf([
        {
          type: 'tool-call',
          toolCallId: 'call-1',
          toolName: 'record_goal',
          input: JSON.stringify({
            projectId: 'project-1',
            title: 'Fewer late invoices',
            rationale: 'Ada: "we chase invoices by hand"',
            fields: { outcome: 'Halve late invoices' },
          }),
        },
        { type: 'finish', finishReason: 'tool-calls', usage },
      ]),
    ];
    let turn = 0;
    const model = new MastraLanguageModelV2Mock({
      doStream: async () =>
        turns[turn++] ??
        streamOf([
          { type: 'text-start', id: 'text-1' },
          { type: 'text-delta', id: 'text-1', delta: 'Done.' },
          { type: 'text-end', id: 'text-1' },
          { type: 'finish', finishReason: 'stop', usage },
        ]),
    });
    const intentra = createIntentra({
      intentra: definition(model),
      specialists: [],
      memory: new MockMemory(),
      onUnexpectedError: vi.fn(),
    });
    const requestContext = requestContextWith(() =>
      Promise.resolve({ key: 'GOAL-1' } as never),
    );
    const memory = { thread: 'thread-1', resource: 'member-1' };
    const first = await intentra.stream(
      [{ role: 'user', content: 'We want fewer late invoices' }],
      { requestContext, memory, maxSteps: 5 },
    );
    await first.consumeStream();

    // Act
    const second = await intentra.stream(
      [{ role: 'user', content: 'What did you record?' }],
      { requestContext, memory, maxSteps: 5 },
    );
    await second.consumeStream();

    // Assert
    const prompt = JSON.stringify(model.doStreamCalls.at(-1)?.prompt);
    expect(prompt).toContain('We want fewer late invoices');
    expect(prompt).toContain('Done.');
    expect(prompt).toContain('record_goal');
    expect(prompt).not.toContain('list_knowledge');
  });

  it('ends its turn with the choices it offers', async () => {
    // Arrange
    const turns = [
      streamOf([
        {
          type: 'tool-call',
          toolCallId: 'call-1',
          toolName: 'offer_choices',
          input: JSON.stringify({
            question: 'Which priority?',
            options: [{ label: 'Must' }, { label: 'Could' }],
          }),
        },
        { type: 'finish', finishReason: 'tool-calls', usage },
      ]),
      streamOf([
        { type: 'text-start', id: 'text-1' },
        { type: 'text-delta', id: 'text-1', delta: 'I have asked.' },
        { type: 'text-end', id: 'text-1' },
        { type: 'finish', finishReason: 'stop', usage },
      ]),
    ];
    let turn = 0;
    const model = new MastraLanguageModelV2Mock({
      doStream: async () => turns[turn++] ?? streamOf([]),
    });
    const intentra = createIntentra({
      intentra: definition(model, { toolIds: ['offer_choices'] }),
      specialists: [],
      memory: new MockMemory(),
      onUnexpectedError: vi.fn(),
    });

    // Act
    const output = await intentra.stream(
      [{ role: 'user', content: 'Ask me' }],
      {
        requestContext: requestContextWith(() =>
          Promise.reject(new Error('x')),
        ),
        maxSteps: 5,
      },
    );
    await output.consumeStream();

    // Assert
    expect(model.doStreamCalls).toHaveLength(1);
  });

  it('gives a Viewer only the tools that read, whatever the definition says', async () => {
    // Arrange
    const model = answeringModel('Hello.');
    const intentra = createIntentra({
      intentra: definition(model),
      specialists: [],
      memory: new MockMemory(),
      onUnexpectedError: vi.fn(),
    });

    // Act
    const output = await intentra.stream(
      [{ role: 'user', content: 'Record a goal' }],
      {
        requestContext: requestContextWith(
          () => Promise.reject(new Error('x')),
          'viewer',
        ),
        maxSteps: 5,
      },
    );
    await output.consumeStream();

    // Assert
    const tools = JSON.stringify(model.doStreamCalls[0]?.tools);
    expect(tools).toContain('list_knowledge');
    expect(tools).not.toContain('record_goal');
  });

  it("runs on its Model Profile's tuning", async () => {
    // Arrange
    const model = answeringModel('Hello.');
    const intentra = createIntentra({
      intentra: definition(model, {
        temperature: 0.3,
        maxOutputTokens: 500,
        reasoningEffort: 'high',
      }),
      specialists: [],
      memory: new MockMemory(),
      onUnexpectedError: vi.fn(),
    });

    // Act
    const output = await intentra.stream([{ role: 'user', content: 'Hi' }], {
      requestContext: requestContextWith(() => Promise.reject(new Error('x'))),
      maxSteps: 5,
    });
    await output.consumeStream();

    // Assert
    expect(model.doStreamCalls[0]).toMatchObject({
      temperature: 0.3,
      maxOutputTokens: 500,
      providerOptions: { openrouter: { reasoning: { effort: 'high' } } },
    });
  });

  it('calls a Specialist in the same Project, which keeps nothing in memory', async () => {
    // Arrange
    const turns = [
      streamOf([
        {
          type: 'tool-call',
          toolCallId: 'call-1',
          toolName: 'agent-ux_researcher',
          input: JSON.stringify({ prompt: 'Find the gaps in billing' }),
        },
        { type: 'finish', finishReason: 'tool-calls', usage },
      ]),
      streamOf([
        { type: 'text-start', id: 'text-1' },
        {
          type: 'text-delta',
          id: 'text-1',
          delta: 'The researcher found none.',
        },
        { type: 'text-end', id: 'text-1' },
        { type: 'finish', finishReason: 'stop', usage },
      ]),
    ];
    let turn = 0;
    const intentraModel = new MastraLanguageModelV2Mock({
      doStream: async () => turns[turn++] ?? streamOf([]),
    });
    const specialistModel = answeringModel('No gaps.');
    const memory = new MockMemory();
    const intentra = createIntentra({
      intentra: definition(intentraModel),
      specialists: [
        definition(specialistModel, {
          name: 'UX researcher',
          description: 'Finds gaps in requirements',
          instructions: 'Find the gaps.',
        }),
      ],
      memory,
      onUnexpectedError: vi.fn(),
    });

    // Act
    const output = await intentra.stream(
      [{ role: 'user', content: 'Check billing' }],
      {
        requestContext: requestContextWith(() =>
          Promise.reject(new Error('x')),
        ),
        memory: { thread: 'thread-1', resource: 'member-1' },
        maxSteps: 5,
      },
    );
    await output.consumeStream();

    // Assert
    expect(JSON.stringify(specialistModel.doStreamCalls[0]?.prompt)).toContain(
      'Billing',
    );
    expect(JSON.stringify(intentraModel.doStreamCalls[1]?.prompt)).toContain(
      'No gaps.',
    );
    const threads = await memory.listThreads({ perPage: false });
    expect(threads.threads.map(thread => thread.id)).toEqual(['thread-1']);
  });

  it('sees the names and descriptions of its Skills', async () => {
    // Arrange
    const model = answeringModel('Hello.');
    const intentra = createIntentra({
      intentra: definition(model, {
        skills: [
          {
            name: 'intentra-interviewing',
            description: 'When interviewing a person',
            instructions: 'Ask one question at a time.',
          },
        ],
      }),
      specialists: [],
      memory: new MockMemory(),
      onUnexpectedError: vi.fn(),
    });

    // Act
    const output = await intentra.stream([{ role: 'user', content: 'Hi' }], {
      requestContext: requestContextWith(() => Promise.reject(new Error('x'))),
      maxSteps: 5,
    });
    await output.consumeStream();

    // Assert
    const call = JSON.stringify(model.doStreamCalls[0]);
    expect(call).toContain('intentra-interviewing');
    expect(call).toContain('When interviewing a person');
  });
});
