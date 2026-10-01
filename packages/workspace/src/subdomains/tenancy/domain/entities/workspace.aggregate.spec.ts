import { describe, expect, it } from 'vitest';

import {
  InvalidWorkspaceNameException,
  InvalidWorkspaceSlugException,
  WorkspaceSuspendedException,
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

  describe('suspension', () => {
    it('refuses changes while suspended', () => {
      // Arrange
      const workspace = Workspace.create({ name: 'Acme', slug: 'acme' });

      // Act
      workspace.suspend();

      // Assert
      expect(workspace.isSuspended).toBe(true);
      expect(() => workspace.ensureChangeable()).toThrow(
        WorkspaceSuspendedException,
      );
    });

    it('takes changes again once resumed', () => {
      // Arrange
      const workspace = Workspace.create({ name: 'Acme', slug: 'acme' });
      workspace.suspend();

      // Act
      workspace.resume();

      // Assert
      expect(() => workspace.ensureChangeable()).not.toThrow();
    });
  });
});
