import { describe, expect, it } from 'vitest';

import { InvalidWorkspaceSlugException } from '../exceptions/index.js';

import { WorkspaceSlug } from './workspace-slug.vo.js';

describe('WorkspaceSlug', () => {
  it.each(['acme', 'acme-corp', 'acme-corp-2', 'a1b', 'a'.repeat(15)])(
    'accepts %j',
    value => {
      // Act
      const slug = new WorkspaceSlug(value);

      // Assert
      expect(slug.value).toBe(value);
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
    // Act
    const creating = () => new WorkspaceSlug(value);

    // Assert
    expect(creating).toThrow(InvalidWorkspaceSlugException);
  });
});
