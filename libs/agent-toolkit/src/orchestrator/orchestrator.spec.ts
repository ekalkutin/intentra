import { RequestContext } from '@mastra/core/request-context';
import { MastraLanguageModelV2Mock } from '@mastra/core/test-utils/llm-mock';
import { describe, expect, it, vi } from 'vitest';

import type { ToolApis } from '../tool-apis.js';

import type { OrchestratorContext } from './orchestrator-context.js';
import { createOrchestrator } from './orchestrator.js';

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
): RequestContext<OrchestratorContext> {
  const requestContext = new RequestContext<OrchestratorContext>();
  requestContext.set('apis', {
    workspace: { knowledge: { record } },
  } as unknown as ToolApis);
  requestContext.set('caller', {
    actor: { accountId: 'account-1', email: 'ada@example.com' },
    agent: { level: 'contributor' },
  });
  requestContext.set('workspaceId', 'workspace-1');
  requestContext.set('project', {
    id: 'project-1',
    name: 'Billing',
    role: 'maintainer',
  });

  return requestContext;
}

/** Runs one Conversation turn and gives what the model was sent the second time. */
async function converse(
  record: () => Promise<never>,
  onUnexpectedError = vi.fn(),
) {
  const model = recordingModel();
  const orchestrator = createOrchestrator({ model, onUnexpectedError });
  const output = await orchestrator.stream(
    [{ role: 'user', content: 'We want fewer late invoices' }],
    { requestContext: requestContextWith(record), maxSteps: 5 },
  );
  await output.consumeStream();

  return { calls: model.doStreamCalls, onUnexpectedError };
}

describe('Orchestrator', () => {
  it("is told its Project and the Member's Project Role", async () => {
    // Act
    const { calls } = await converse(() => Promise.reject(new Error('x')));

    // Assert
    const system = JSON.stringify(calls[0]?.prompt[0]);
    expect(system).toContain('Billing');
    expect(system).toContain('project-1');
    expect(system).toContain('They are a Maintainer');
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
});
