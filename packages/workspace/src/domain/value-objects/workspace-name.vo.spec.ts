import { describe, expect, it } from 'vitest';

import { InvalidWorkspaceNameException } from '../exceptions/index.js';

import { WorkspaceName } from './workspace-name.vo.js';

describe('WorkspaceName', () => {
  it('trims surrounding spaces', () => {
    expect(new WorkspaceName('  Acme Corp  ').value).toBe('Acme Corp');
  });

  it('accepts 100 characters', () => {
    expect(new WorkspaceName('a'.repeat(100)).value).toHaveLength(100);
  });

  it.each(['', '   ', 'a'.repeat(101)])('rejects %j', value => {
    expect(() => new WorkspaceName(value)).toThrow(
      InvalidWorkspaceNameException,
    );
  });
});
