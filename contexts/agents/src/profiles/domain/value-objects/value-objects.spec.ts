import { describe, expect, it } from 'vitest';

import { AgentName } from './agent-name.vo.js';
import { Instructions } from './instructions.vo.js';
import { ModelRef } from './model-ref.vo.js';
import { ToolId } from './tool-id.vo.js';

describe('AgentName', () => {
  it('trims the value', () => {
    expect(new AgentName('  Architect  ').value).toBe('Architect');
  });

  it('rejects an empty name', () => {
    expect(() => new AgentName('   ')).toThrow('Agent name cannot be empty');
  });

  it('rejects a name longer than the limit', () => {
    expect(() => new AgentName('a'.repeat(AgentName.MAX_LENGTH + 1))).toThrow();
  });
});

describe('Instructions', () => {
  it('rejects empty instructions', () => {
    expect(() => new Instructions('')).toThrow('Instructions cannot be empty');
  });
});

describe('ModelRef', () => {
  it('compares by provider and name', () => {
    const model = new ModelRef('anthropic', 'claude-sonnet-5');

    expect(model.equals(new ModelRef('anthropic', 'claude-sonnet-5'))).toBe(
      true,
    );
    expect(model.equals(new ModelRef('anthropic', 'claude-opus-5-5'))).toBe(
      false,
    );
  });
});

describe('ToolId', () => {
  it('accepts a snake_case id', () => {
    expect(new ToolId('list_workspaces').value).toBe('list_workspaces');
  });

  it.each(['', 'find-accounts', 'ListWorkspaces', 'list__workspaces'])(
    'rejects %j',
    value => {
      expect(() => new ToolId(value)).toThrow('Tool id must be snake_case');
    },
  );
});
