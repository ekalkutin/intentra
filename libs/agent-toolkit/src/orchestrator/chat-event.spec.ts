import type { ChunkType } from '@mastra/core/stream';
import { describe, expect, it } from 'vitest';

import { AGENT_FAILED, toChatEvent } from './chat-event.js';

function chunk(type: string, payload: object): ChunkType {
  return { type, payload, runId: 'run-1', from: 'AGENT' } as ChunkType;
}

describe('toChatEvent', () => {
  it('passes text on', () => {
    // Act
    const event = toChatEvent(chunk('text-delta', { id: 't', text: 'Hi' }));

    // Assert
    expect(event).toEqual({ type: 'text-delta', text: 'Hi' });
  });

  it('passes a tool call on with its arguments', () => {
    // Act
    const event = toChatEvent(
      chunk('tool-call', {
        toolCallId: 'call-1',
        toolName: 'list_knowledge',
        args: { projectId: 'p-1' },
      }),
    );

    // Assert
    expect(event).toEqual({
      type: 'tool-call',
      toolCallId: 'call-1',
      toolName: 'list_knowledge',
      args: { projectId: 'p-1' },
    });
  });

  it('passes a tool result on', () => {
    // Act
    const event = toChatEvent(
      chunk('tool-result', {
        toolCallId: 'call-1',
        toolName: 'list_knowledge',
        result: { items: [], total: 0 },
      }),
    );

    // Assert
    expect(event).toEqual({
      type: 'tool-result',
      toolCallId: 'call-1',
      toolName: 'list_knowledge',
      result: { items: [], total: 0 },
      isError: false,
    });
  });

  it('marks a returned validation error as a failed call', () => {
    // Arrange
    const result = {
      error: true,
      message: 'Tool input validation failed',
      validationErrors: {},
    };

    // Act
    const event = toChatEvent(
      chunk('tool-result', {
        toolCallId: 'call-1',
        toolName: 'record_goal',
        result,
      }),
    );

    // Assert
    expect(event).toMatchObject({ type: 'tool-result', result, isError: true });
  });

  it('turns a thrown tool error into a failed call with what the model saw', () => {
    // Act
    const event = toChatEvent(
      chunk('tool-error', {
        toolCallId: 'call-1',
        toolName: 'edit_goal',
        error: new Error('KNOWLEDGE_ITEM_CHANGED: Knowledge item has changed'),
      }),
    );

    // Assert
    expect(event).toEqual({
      type: 'tool-result',
      toolCallId: 'call-1',
      toolName: 'edit_goal',
      result: 'KNOWLEDGE_ITEM_CHANGED: Knowledge item has changed',
      isError: true,
    });
  });

  it('hides why the stream failed', () => {
    // Act
    const event = toChatEvent(
      chunk('error', { error: new Error('401 from the provider') }),
    );

    // Assert
    expect(event).toEqual(AGENT_FAILED);
  });

  it('gives the finish reason', () => {
    // Act
    const event = toChatEvent(
      chunk('finish', { stepResult: { reason: 'stop' }, output: {} }),
    );

    // Assert
    expect(event).toEqual({ type: 'finish', finishReason: 'stop' });
  });

  it.each(['start', 'step-start', 'text-start', 'reasoning-delta'])(
    'leaves %s out',
    type => {
      // Act
      const event = toChatEvent(chunk(type, { id: 'x', text: '' }));

      // Assert
      expect(event).toBeNull();
    },
  );
});
