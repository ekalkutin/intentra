import { describe, expect, it } from 'vitest';

import { ProjectId } from './project-id.vo.js';
import { WorkspaceId } from './workspace-id.vo.js';

describe('EntityId', () => {
  it('generates a value when none is given', () => {
    expect(new WorkspaceId().value).toHaveLength(36);
  });

  it('keeps the given value', () => {
    const id = new WorkspaceId('11111111-1111-1111-1111-111111111111');

    expect(id.value).toBe('11111111-1111-1111-1111-111111111111');
  });

  it('rejects an empty value', () => {
    expect(() => new ProjectId('')).toThrow('EntityId cannot be empty');
  });

  it('compares by value, not by reference', () => {
    const value = '22222222-2222-2222-2222-222222222222';

    expect(new ProjectId(value).equals(new ProjectId(value))).toBe(true);
  });

  it('serializes to a string', () => {
    const id = new ProjectId('33333333-3333-3333-3333-333333333333');

    expect(JSON.stringify({ id })).toBe(
      '{"id":"33333333-3333-3333-3333-333333333333"}',
    );
  });
});
