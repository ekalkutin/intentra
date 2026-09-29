import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { Actor } from '@intentra/contracts/iam';
import { TestingApp } from '@intentra/platform-testing';
import { AccountId, UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import { Member } from '../../domain/entities/index.js';
import { NotWorkspaceOwnerException } from '../../domain/exceptions/index.js';
import { WorkspaceModule } from '../../workspace.module.js';
import {
  ProjectSlugTakenException,
  WorkspaceNotFoundException,
} from '../exceptions/index.js';
import { MemberRepository } from '../ports/outbound/index.js';

import { ProjectsService } from './projects.service.js';
import { WorkspacesService } from './workspaces.service.js';

function actor(): Actor {
  return { accountId: new AccountId().value, email: 'ada@example.com' };
}

describe('ProjectsService integration', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({ imports: [WorkspaceModule.register({})] });
  });

  afterEach(() => app.clearDatabase());

  afterAll(() => app?.close());

  async function createWorkspace(owner: Actor): Promise<string> {
    const workspace = await app
      .get(WorkspacesService)
      .create(owner, { name: 'Acme', slug: 'acme' });

    return workspace.id;
  }

  async function addContributor(workspaceId: string): Promise<Actor> {
    const contributor = actor();
    const member = Member.join({
      workspaceId,
      accountId: contributor.accountId,
      email: contributor.email,
    });
    await app.get(UnitOfWork).run(() => app.get(MemberRepository).save(member));

    return contributor;
  }

  describe('create', () => {
    it('lets the Owner create a Project', async () => {
      // Arrange
      const owner = actor();
      const workspaceId = await createWorkspace(owner);

      // Act
      const project = await app
        .get(ProjectsService)
        .create(owner, workspaceId, { name: 'Billing', slug: 'billing' });

      // Assert
      expect(project).toEqual({
        id: expect.any(String),
        name: 'Billing',
        slug: 'billing',
      });
    });

    it('rejects a Contributor', async () => {
      // Arrange
      const workspaceId = await createWorkspace(actor());
      const contributor = await addContributor(workspaceId);

      // Act
      const creation = app
        .get(ProjectsService)
        .create(contributor, workspaceId, { name: 'Billing', slug: 'billing' });

      // Assert
      await expect(creation).rejects.toBeInstanceOf(NotWorkspaceOwnerException);
    });

    it('hides the Workspace from an outsider', async () => {
      // Arrange
      const workspaceId = await createWorkspace(actor());

      // Act
      const creation = app
        .get(ProjectsService)
        .create(actor(), workspaceId, { name: 'Billing', slug: 'billing' });

      // Assert
      await expect(creation).rejects.toBeInstanceOf(WorkspaceNotFoundException);
    });

    it('rejects a slug taken in the same Workspace', async () => {
      // Arrange
      const owner = actor();
      const workspaceId = await createWorkspace(owner);
      const service = app.get(ProjectsService);
      await service.create(owner, workspaceId, {
        name: 'Billing',
        slug: 'billing',
      });

      // Act
      const creation = service.create(owner, workspaceId, {
        name: 'Billing 2',
        slug: 'billing',
      });

      // Assert
      await expect(creation).rejects.toBeInstanceOf(ProjectSlugTakenException);
    });

    it('allows the same slug in another Workspace', async () => {
      // Arrange
      const ada = actor();
      const bob = actor();
      const service = app.get(ProjectsService);
      const adaWorkspaceId = await createWorkspace(ada);
      const bobWorkspace = await app
        .get(WorkspacesService)
        .create(bob, { name: 'Globex', slug: 'globex' });
      await service.create(ada, adaWorkspaceId, {
        name: 'Billing',
        slug: 'billing',
      });

      // Act
      const creation = service.create(bob, bobWorkspace.id, {
        name: 'Billing',
        slug: 'billing',
      });

      // Assert
      await expect(creation).resolves.toHaveProperty('slug', 'billing');
    });
  });

  describe('list', () => {
    it('shows the Projects to every Member, sorted by name', async () => {
      // Arrange
      const owner = actor();
      const workspaceId = await createWorkspace(owner);
      const contributor = await addContributor(workspaceId);
      const service = app.get(ProjectsService);
      await service.create(owner, workspaceId, { name: 'Web', slug: 'web' });
      await service.create(owner, workspaceId, { name: 'API', slug: 'api' });

      // Act
      const projects = await service.list(contributor, workspaceId);

      // Assert
      expect(projects.map(project => project.slug)).toEqual(['api', 'web']);
    });

    it('hides the Workspace from an outsider', async () => {
      // Arrange
      const workspaceId = await createWorkspace(actor());

      // Act
      const listing = app.get(ProjectsService).list(actor(), workspaceId);

      // Assert
      await expect(listing).rejects.toBeInstanceOf(WorkspaceNotFoundException);
    });

    it('reports a Workspace that does not exist the same way', async () => {
      // Act
      const listing = app
        .get(ProjectsService)
        .list(actor(), new WorkspaceId().value);

      // Assert
      await expect(listing).rejects.toBeInstanceOf(WorkspaceNotFoundException);
    });
  });
});
