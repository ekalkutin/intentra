import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import type { Actor } from '@intentra/contracts/iam';
import { TestingApp } from '@intentra/platform-testing';
import { ProjectId, UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import { givenAccount } from '../../../../testing/account.fixtures.js';
import { givenOpenWorkspaceCreation } from '../../../../testing/workspace-creation.fixtures.js';
import { WorkspaceModule } from '../../../../workspace.module.js';
import { Member } from '../../domain/entities/index.js';
import {
  ProjectCreationForbiddenException,
  ProjectDeletionForbiddenException,
  ProjectSlugMismatchException,
} from '../../domain/exceptions/index.js';
import { Role } from '../../domain/value-objects/index.js';
import {
  ProjectNotFoundException,
  ProjectSlugTakenException,
  WorkspaceNotFoundException,
} from '../exceptions/index.js';
import { MemberRepository } from '../ports/outbound/index.js';

import { ProjectsService } from './projects.service.js';
import { WorkspacesService } from './workspaces.service.js';

describe('ProjectsService integration', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({ imports: [WorkspaceModule.register({})] });
  });

  beforeEach(() => givenOpenWorkspaceCreation(app));

  afterEach(() => app.clearDatabase());

  afterAll(() => app?.close());

  async function createWorkspace(owner: Actor): Promise<string> {
    const workspace = await app
      .get(WorkspacesService)
      .create(owner, { name: 'Acme', slug: 'acme' });

    return workspace.id;
  }

  async function addMember(
    workspaceId: string,
    role: Role | null = null,
  ): Promise<Actor> {
    const joiner = await givenAccount(app);
    const member = Member.join({
      workspaceId,
      accountId: joiner.accountId,
      email: joiner.email,
      name: joiner.name,
    });
    member.changeRole(role);
    await app.get(UnitOfWork).run(() => app.get(MemberRepository).save(member));

    return joiner;
  }

  describe('create', () => {
    it('lets the Owner create a Project', async () => {
      // Arrange
      const owner = await givenAccount(app);
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

    it('rejects a Member without a Role', async () => {
      // Arrange
      const workspaceId = await createWorkspace(await givenAccount(app));
      const member = await addMember(workspaceId);

      // Act
      const creation = app
        .get(ProjectsService)
        .create(member, workspaceId, { name: 'Billing', slug: 'billing' });

      // Assert
      await expect(creation).rejects.toBeInstanceOf(
        ProjectCreationForbiddenException,
      );
    });

    it('lets a Manager create a Project', async () => {
      // Arrange
      const workspaceId = await createWorkspace(await givenAccount(app));
      const manager = await addMember(workspaceId, Role.Manager);

      // Act
      const project = await app
        .get(ProjectsService)
        .create(manager, workspaceId, { name: 'Billing', slug: 'billing' });

      // Assert
      expect(project).toMatchObject({ name: 'Billing', slug: 'billing' });
    });

    it('hides the Workspace from an outsider', async () => {
      // Arrange
      const workspaceId = await createWorkspace(await givenAccount(app));

      // Act
      const creation = app
        .get(ProjectsService)
        .create(await givenAccount(app), workspaceId, {
          name: 'Billing',
          slug: 'billing',
        });

      // Assert
      await expect(creation).rejects.toBeInstanceOf(WorkspaceNotFoundException);
    });

    it('rejects a slug taken in the same Workspace', async () => {
      // Arrange
      const owner = await givenAccount(app);
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
      const ada = await givenAccount(app);
      const bob = await givenAccount(app);
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
      const owner = await givenAccount(app);
      const workspaceId = await createWorkspace(owner);
      const member = await addMember(workspaceId);
      const service = app.get(ProjectsService);
      await service.create(owner, workspaceId, { name: 'Web', slug: 'web' });
      await service.create(owner, workspaceId, { name: 'API', slug: 'api' });

      // Act
      const projects = await service.list(member, workspaceId);

      // Assert
      expect(projects.map(project => project.slug)).toEqual(['api', 'web']);
    });

    it('hides the Workspace from an outsider', async () => {
      // Arrange
      const workspaceId = await createWorkspace(await givenAccount(app));

      // Act
      const listing = app
        .get(ProjectsService)
        .list(await givenAccount(app), workspaceId);

      // Assert
      await expect(listing).rejects.toBeInstanceOf(WorkspaceNotFoundException);
    });

    it('reports a Workspace that does not exist the same way', async () => {
      // Act
      const listing = app
        .get(ProjectsService)
        .list(await givenAccount(app), new WorkspaceId().value);

      // Assert
      await expect(listing).rejects.toBeInstanceOf(WorkspaceNotFoundException);
    });
  });

  describe('delete', () => {
    it('lets the Owner delete a Project, freeing its slug', async () => {
      // Arrange
      const owner = await givenAccount(app);
      const workspaceId = await createWorkspace(owner);
      const service = app.get(ProjectsService);
      const project = await service.create(owner, workspaceId, {
        name: 'Billing',
        slug: 'billing',
      });

      // Act
      await service.delete(owner, workspaceId, project.id, { slug: 'billing' });

      // Assert
      await expect(service.list(owner, workspaceId)).resolves.toEqual([]);
      await expect(
        service.create(owner, workspaceId, {
          name: 'Billing',
          slug: 'billing',
        }),
      ).resolves.toMatchObject({ slug: 'billing' });
    });

    it('keeps the Project when the slug does not match', async () => {
      // Arrange
      const owner = await givenAccount(app);
      const workspaceId = await createWorkspace(owner);
      const service = app.get(ProjectsService);
      const project = await service.create(owner, workspaceId, {
        name: 'Billing',
        slug: 'billing',
      });

      // Act
      const deletion = service.delete(owner, workspaceId, project.id, {
        slug: 'bill',
      });

      // Assert
      await expect(deletion).rejects.toBeInstanceOf(
        ProjectSlugMismatchException,
      );
      await expect(service.list(owner, workspaceId)).resolves.toEqual([
        project,
      ]);
    });

    it('lets a Manager delete a Project they created', async () => {
      // Arrange
      const workspaceId = await createWorkspace(await givenAccount(app));
      const manager = await addMember(workspaceId, Role.Manager);
      const service = app.get(ProjectsService);
      const project = await service.create(manager, workspaceId, {
        name: 'Billing',
        slug: 'billing',
      });

      // Act
      await service.delete(manager, workspaceId, project.id, {
        slug: 'billing',
      });

      // Assert
      await expect(service.list(manager, workspaceId)).resolves.toEqual([]);
    });

    it('rejects a Manager deleting a Project someone else created', async () => {
      // Arrange
      const owner = await givenAccount(app);
      const workspaceId = await createWorkspace(owner);
      const manager = await addMember(workspaceId, Role.Manager);
      const service = app.get(ProjectsService);
      const project = await service.create(owner, workspaceId, {
        name: 'Billing',
        slug: 'billing',
      });

      // Act
      const deletion = service.delete(manager, workspaceId, project.id, {
        slug: 'billing',
      });

      // Assert
      await expect(deletion).rejects.toBeInstanceOf(
        ProjectDeletionForbiddenException,
      );
    });

    it('reports an unknown Project as not found', async () => {
      // Arrange
      const owner = await givenAccount(app);
      const workspaceId = await createWorkspace(owner);

      // Act
      const deletion = app
        .get(ProjectsService)
        .delete(owner, workspaceId, new ProjectId().value, { slug: 'billing' });

      // Assert
      await expect(deletion).rejects.toBeInstanceOf(ProjectNotFoundException);
    });
  });
});
