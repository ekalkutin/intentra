import { describe, expect, it } from 'vitest';

import { InvalidWorkspaceSlugException } from '../exceptions/index.js';

import { WorkspaceSlug } from './workspace-slug.vo.js';

describe('WorkspaceSlug', () => {
  it.each(['acme', 'acme-corp', 'acme-corp-2', 'a1b', 'a'.repeat(15)])(
    'accepts %j',
    value => {
      expect(new WorkspaceSlug(value).value).toBe(value);
    },
  );

  it.each([
    'ab',
    'a'.repeat(16),
    'Acme',
    'acme corp',
    '-acme',
    'acme-',
    'acme--corp',
    'acme_corp',
  ])('rejects %j', value => {
    expect(() => new WorkspaceSlug(value)).toThrow(
      InvalidWorkspaceSlugException,
    );
  });
});
