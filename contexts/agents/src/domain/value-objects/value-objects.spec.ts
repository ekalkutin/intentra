import { describe, expect, it } from 'vitest';

import { AgentDescription } from './agent-description.vo.js';
import { AgentName } from './agent-name.vo.js';
import { AgentRole } from './agent-role.vo.js';
import { ApiKey } from './api-key.vo.js';
import { Instructions } from './instructions.vo.js';
import { ModelId } from './model-id.vo.js';
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

describe('AgentDescription', () => {
  it('rejects an empty description', () => {
    expect(() => new AgentDescription(' ')).toThrow(
      'Agent description cannot be empty',
    );
  });
});

describe('ModelId', () => {
  it('accepts an OpenRouter id and trims it', () => {
    expect(new ModelId(' openai/gpt-5:free ').value).toBe('openai/gpt-5:free');
  });

  it.each(['', 'claude-sonnet-5', 'anthropic/ claude'])('rejects %j', value => {
    expect(() => new ModelId(value)).toThrow('Model id must look like');
  });
});

describe('AgentRole', () => {
  it('reads a stored role back as the same instance', () => {
    expect(AgentRole.from('orchestrator')).toBe(AgentRole.ORCHESTRATOR);
  });

  it('rejects an unknown role', () => {
    expect(() => AgentRole.from('admin')).toThrow('Unknown agent role');
  });
});

describe('ApiKey', () => {
  it('hints with the last four characters', () => {
    expect(new ApiKey(' sk-or-v1-abcdef1234 ').hint).toBe('1234');
  });

  it('never shows itself in JSON', () => {
    expect(JSON.stringify({ key: new ApiKey('sk-or-v1-secret1234') })).toBe(
      '{"key":"…1234"}',
    );
  });

  it('rejects a key with spaces', () => {
    expect(() => new ApiKey('sk or')).toThrow();
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
