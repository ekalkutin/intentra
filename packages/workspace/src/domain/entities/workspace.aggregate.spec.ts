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
      const ownerId = new MemberId();

      const workspace = createWorkspace(ownerId);

      expect(workspace.name.value).toBe('Acme Corp');
      expect(workspace.slug.value).toBe('acme-corp');
      expect(workspace.isOwnedBy(ownerId)).toBe(true);
    });

    it('rejects an invalid name', () => {
      expect(() =>
        Workspace.create({
          name: ' ',
          slug: 'acme',
          ownerId: new MemberId().value,
        }),
      ).toThrow(InvalidWorkspaceNameException);
    });

    it('rejects an invalid slug', () => {
      expect(() =>
        Workspace.create({
          name: 'Acme',
          slug: 'Acme Corp',
          ownerId: new MemberId().value,
        }),
      ).toThrow(InvalidWorkspaceSlugException);
    });
  });

  describe('rename', () => {
    it('changes the name but keeps the slug', () => {
      const workspace = createWorkspace();

      workspace.rename('Acme Industries');

      expect(workspace.name.value).toBe('Acme Industries');
      expect(workspace.slug.value).toBe('acme-corp');
    });

    it('rejects an invalid name', () => {
      const workspace = createWorkspace();

      expect(() => workspace.rename('')).toThrow(InvalidWorkspaceNameException);
    });
  });
});
