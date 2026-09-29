import { describe, expect, it } from 'vitest';

import {
  InvalidWorkspaceNameException,
  InvalidWorkspaceSlugException,
} from '../exceptions/index.js';
import { MemberId } from '../value-objects/index.js';

import { Workspace } from './workspace.aggregate.js';

function createWorkspace(ownerId = new MemberId()): Workspace {
  return Workspace.create({
    name: 'Acme Corp',
    slug: 'acme-corp',
    ownerId: ownerId.value,
  });
}

describe('Workspace', () => {
  describe('create', () => {
    it('is owned by the given Member', () => {
      // Arrange
      const ownerId = new MemberId();

      // Act
      const workspace = createWorkspace(ownerId);

      // Assert
      expect(workspace.name.value).toBe('Acme Corp');
      expect(workspace.slug.value).toBe('acme-corp');
      expect(workspace.isOwnedBy(ownerId)).toBe(true);
    });

    it('rejects an invalid name', () => {
      // Act
      const creating = () =>
        Workspace.create({
          name: ' ',
          slug: 'acme',
          ownerId: new MemberId().value,
        });

      // Assert
      expect(creating).toThrow(InvalidWorkspaceNameException);
    });

    it('rejects an invalid slug', () => {
      // Act
      const creating = () =>
        Workspace.create({
          name: 'Acme',
          slug: 'Acme Corp',
          ownerId: new MemberId().value,
        });

      // Assert
      expect(creating).toThrow(InvalidWorkspaceSlugException);
    });
  });

  describe('rename', () => {
    it('changes the name but keeps the slug', () => {
      // Arrange
      const workspace = createWorkspace();

      // Act
      workspace.rename('Acme Industries');

      // Assert
      expect(workspace.name.value).toBe('Acme Industries');
      expect(workspace.slug.value).toBe('acme-corp');
    });

    it('rejects an invalid name', () => {
      // Arrange
      const workspace = createWorkspace();

      // Act
      const renaming = () => workspace.rename('');

      // Assert
      expect(renaming).toThrow(InvalidWorkspaceNameException);
    });
  });
});
