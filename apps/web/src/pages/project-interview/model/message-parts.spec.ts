import type { UIMessage } from 'ai';
import { describe, expect, it } from 'vitest';

import {
  ACTIVITIES,
  capturedKeys,
  currentActivity,
  readMessage,
} from './message-parts';

function assistant(parts: unknown[]): UIMessage {
  return { id: 'm1', role: 'assistant', parts } as UIMessage;
}

const RECORDED = {
  type: 'tool-record_requirement',
  toolCallId: 'c1',
  state: 'output-available',
  input: { title: 'Sign-in' },
  output: { key: 'REQ-12', kind: 'requirement', title: 'Sign-in' },
};

describe('readMessage', () => {
  it('shows text, finished writes and choice cards, keeping the rest as steps', () => {
    // Arrange
    const message = assistant([
      { type: 'reasoning', text: 'Let me check.', state: 'done' },
      {
        type: 'tool-list_knowledge',
        toolCallId: 'c0',
        state: 'output-available',
        input: {},
        output: [],
      },
      RECORDED,
      { type: 'text', text: 'Recorded REQ-12.', state: 'done' },
      {
        type: 'tool-offer_choices',
        toolCallId: 'c2',
        state: 'output-available',
        input: {
          question: 'Which first?',
          options: [{ label: 'Web' }, { label: 'Mobile' }],
        },
        output: { shown: true },
      },
    ]);

    // Act
    const { blocks, steps } = readMessage(message);

    // Assert
    expect(blocks.map(block => block.type)).toEqual([
      'write',
      'text',
      'choices',
    ]);
    expect(blocks[0]).toMatchObject({
      action: 'record',
      item: { key: 'REQ-12', kind: 'requirement', title: 'Sign-in' },
      error: null,
    });
    expect(steps.map(step => step.activity)).toEqual([
      ACTIVITIES.reasoning,
      ACTIVITIES.reading,
      ACTIVITIES.writing,
    ]);
  });

  it('keeps a write still running out of the text and shows a failed one', () => {
    // Arrange
    const message = assistant([
      {
        ...RECORDED,
        toolCallId: 'r',
        state: 'input-available',
        output: undefined,
      },
      {
        type: 'tool-edit_goal',
        toolCallId: 'e',
        state: 'output-error',
        input: { key: 'GOAL-1' },
        errorText: 'KNOWLEDGE_ITEM_CHANGED: changed',
      },
    ]);

    // Act
    const { blocks } = readMessage(message);

    // Assert
    expect(blocks).toEqual([
      expect.objectContaining({
        action: 'edit',
        item: { key: 'GOAL-1', kind: null, title: null },
        error: 'KNOWLEDGE_ITEM_CHANGED: changed',
      }),
    ]);
  });

  it('leaves out choice cards whose input is not valid', () => {
    // Arrange
    const message = assistant([
      {
        type: 'tool-offer_choices',
        toolCallId: 'c',
        state: 'input-available',
        input: { question: 'Only one?', options: [{ label: 'Yes' }] },
      },
    ]);

    // Act
    const { blocks } = readMessage(message);

    // Assert
    expect(blocks).toEqual([]);
  });
});

describe('currentActivity', () => {
  it('names a Specialist being asked', () => {
    // Act
    const current = currentActivity(
      assistant([
        {
          type: 'tool-agent-analyst',
          toolCallId: 'a',
          state: 'input-available',
          input: {},
        },
      ]),
    );

    // Assert
    expect(current).toEqual({
      activity: ACTIVITIES.specialist,
      name: 'agent-analyst',
    });
  });

  it('thinks before anything arrived', () => {
    // Act
    const current = currentActivity(undefined);

    // Assert
    expect(current.activity).toBe(ACTIVITIES.thinking);
  });
});

describe('capturedKeys', () => {
  it('lists each recorded or edited item once', () => {
    // Arrange
    const messages = [
      assistant([RECORDED]),
      { id: 'u', role: 'user', parts: [{ type: 'text', text: 'Change it' }] },
      assistant([
        {
          type: 'tool-edit_requirement',
          toolCallId: 'e',
          state: 'output-available',
          input: { key: 'REQ-12' },
          output: { key: 'REQ-12', kind: 'requirement', title: 'Sign-in' },
        },
        {
          type: 'tool-record_goal',
          toolCallId: 'g',
          state: 'output-available',
          input: {},
          output: { key: 'GOAL-1', kind: 'goal', title: 'Grow' },
        },
      ]),
    ] as UIMessage[];

    // Act
    const keys = capturedKeys(messages);

    // Assert
    expect(keys).toEqual(['REQ-12', 'GOAL-1']);
  });
});
