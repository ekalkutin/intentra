import { describe, expect, it } from 'vitest';

import { WorkspaceAlias } from './workspace-alias.vo.js';

describe('WorkspaceAlias', () => {
  it('is stored trimmed and lower-case', () => {
    expect(new WorkspaceAlias('  Acme-Labs ').value).toBe('acme-labs');
  });

  it('rejects a value outside the shape or length', () => {
    expect(() => new WorkspaceAlias('ab')).toThrow();
    expect(() => new WorkspaceAlias('x'.repeat(41))).toThrow();
    expect(() => new WorkspaceAlias('acme--labs')).toThrow();
    expect(() => new WorkspaceAlias('-acme')).toThrow();
    expect(() => new WorkspaceAlias('acme_labs')).toThrow();
  });
});
