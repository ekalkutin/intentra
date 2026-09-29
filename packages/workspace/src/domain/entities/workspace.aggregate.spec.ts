import { describe, expect, it } from 'vitest';

import {
  InvalidWorkspaceNameException,
  InvalidWorkspaceSlugException,
} from '../exceptions/index.js';

import { Workspace } from './workspace.aggregate.js';

describe('Workspace', () => {
  describe('create', () => {
    it('takes the given name and slug', () => {
      // Act
      const workspace = Workspace.create({
        name: 'Acme Corp',
        slug: 'acme-corp',
      });

      // Assert
      expect(workspace.name.value).toBe('Acme Corp');
      expect(workspace.slug.value).toBe('acme-corp');
    });

    it('rejects an invalid name', () => {
      // Act
      const creating = () => Workspace.create({ name: ' ', slug: 'acme' });

      // Assert
      expect(creating).toThrow(InvalidWorkspaceNameException);
    });

    it('rejects an invalid slug', () => {
      // Act
      const creating = () =>
        Workspace.create({ name: 'Acme', slug: 'Acme Corp' });

      // Assert
      expect(creating).toThrow(InvalidWorkspaceSlugException);
    });
  });
});
