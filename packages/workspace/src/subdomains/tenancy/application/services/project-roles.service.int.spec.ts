import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { Actor } from '@intentra/contracts/iam';
import { TestingApp } from '@intentra/platform-testing';
import { AccountId, ProjectId, UnitOfWork } from '@intentra/shared-kernel';

import { WorkspaceModule } from '../../../../workspace.module.js';
import { Member } from '../../domain/entities/index.js';
import {
  OwnerProjectRoleFixedException,
  ProjectRoleChangeForbiddenException,
} from '../../domain/exceptions/index.js';
import { Role } from '../../domain/value-objects/index.js';
import { ProjectNotFoundException } from '../exceptions/index.js';
import {
  MemberRepository,
  ProjectRoleAssignmentRepository,
} from '../ports/outbound/index.js';

import { MembersService } from './members.service.js';
import { ProjectRolesService } from './project-roles.service.js';
import { ProjectsService } from './projects.service.js';
import { WorkspacesService } from './workspaces.service.js';

function actor(email: string): Actor {
  return { accountId: new AccountId().value, email };
}

describe('ProjectRolesService integration', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({ imports: [WorkspaceModule.register({})] });
  });

  afterEach(() => app.clearDatabase());

  afterAll(() => app?.close());

  type Setup = {
    workspaceId: string;
    projectId: string;
    ada: Actor;
    bob: Actor;
    bobId: string;
  };

  /** Ada owns the Workspace and the Project; Bob is a Member without a Role. */
  async function setUp(bobRole: Role | null = null): Promise<Setup> {
    const ada = actor('ada@example.com');
    const bob = actor('bob@example.com');
    const workspace = await app
      .get(WorkspacesService)
      .create(ada, { name: 'Acme', slug: 'acme' });
    const member = Member.join({
      workspaceId: workspace.id,
      accountId: bob.accountId,
      email: bob.email,
    });
    member.changeRole(bobRole);
    await app.get(UnitOfWork).run(() => app.get(MemberRepository).save(member));
    const project = await app
      .get(ProjectsService)
      .create(ada, workspace.id, { name: 'Billing', slug: 'billing' });

    return {
      workspaceId: workspace.id,
      projectId: project.id,
      ada,
      bob,
      bobId: member.id.value,
    };
  }

  describe('list', () => {
    it('shows every Active Member, a Viewer unless given more', async () => {
      // Arrange
      const { workspaceId, projectId, bob, bobId } = await setUp();

      // Act
      const roles = await app
        .get(ProjectRolesService)
        .list(bob, workspaceId, projectId);

      // Assert
      expect(roles).toEqual([
        {
          memberId: expect.any(String),
          email: 'ada@example.com',
          role: 'maintainer',
        },
        { memberId: bobId, email: 'bob@example.com', role: 'viewer' },
      ]);
    });

    it('makes the Manager who created a Project its Maintainer', async () => {
      // Arrange
      const { workspaceId, bob, bobId } = await setUp(Role.Manager);
      const project = await app
        .get(ProjectsService)
        .create(bob, workspaceId, { name: 'Web', slug: 'web' });

      // Act
      const roles = await app
        .get(ProjectRolesService)
        .list(bob, workspaceId, project.id);

      // Assert
      expect(roles).toContainEqual({
        memberId: bobId,
        email: 'bob@example.com',
        role: 'maintainer',
      });
    });

    it('reports an unknown Project as not found', async () => {
      // Arrange
      const { workspaceId, ada } = await setUp();

      // Act
      const listing = app
        .get(ProjectRolesService)
        .list(ada, workspaceId, new ProjectId().value);

      // Assert
      await expect(listing).rejects.toBeInstanceOf(ProjectNotFoundException);
    });
  });

  describe('change', () => {
    it('lets an Owner give a Member a Project Role', async () => {
      // Arrange
      const { workspaceId, projectId, ada, bobId } = await setUp();

      // Act
      const changed = await app
        .get(ProjectRolesService)
        .change(ada, workspaceId, projectId, bobId, { role: 'contributor' });

      // Assert
      expect(changed).toEqual({
        memberId: bobId,
        email: 'bob@example.com',
        role: 'contributor',
      });
      const roles = await app
        .get(ProjectRolesService)
        .list(ada, workspaceId, projectId);
      expect(roles).toContainEqual(changed);
    });

    it('rejects a Viewer', async () => {
      // Arrange
      const { workspaceId, projectId, bob, bobId } = await setUp();

      // Act
      const changing = app
        .get(ProjectRolesService)
        .change(bob, workspaceId, projectId, bobId, { role: 'maintainer' });

      // Assert
      await expect(changing).rejects.toBeInstanceOf(
        ProjectRoleChangeForbiddenException,
      );
    });

    it("does not change an Owner's Project Role", async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      const [owner] = await app.get(MembersService).list(ada, workspaceId);

      // Act
      const changing = app
        .get(ProjectRolesService)
        .change(ada, workspaceId, projectId, owner!.id, { role: 'viewer' });

      // Assert
      await expect(changing).rejects.toBeInstanceOf(
        OwnerProjectRoleFixedException,
      );
    });
  });

  describe('clean-up', () => {
    async function assignmentsOf(projectId: string) {
      return app
        .get(ProjectRoleAssignmentRepository)
        .findMany({ projectId: new ProjectId(projectId) });
    }

    it('drops the Project Roles of a Member who leaves', async () => {
      // Arrange
      const { workspaceId, projectId, ada, bob, bobId } = await setUp();
      await app
        .get(ProjectRolesService)
        .change(ada, workspaceId, projectId, bobId, { role: 'contributor' });

      // Act
      await app.get(MembersService).leave(bob, workspaceId);

      // Assert
      const assignments = await assignmentsOf(projectId);
      expect(assignments.map(a => a.memberId.value)).not.toContain(bobId);
    });

    it('drops the Project Roles of a deleted Project', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();

      // Act
      await app
        .get(ProjectsService)
        .delete(ada, workspaceId, projectId, { slug: 'billing' });

      // Assert
      await expect(assignmentsOf(projectId)).resolves.toEqual([]);
    });

    it('drops the Project Roles of a deleted Workspace', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();

      // Act
      await app
        .get(WorkspacesService)
        .delete(ada, workspaceId, { slug: 'acme' });

      // Assert
      await expect(assignmentsOf(projectId)).resolves.toEqual([]);
    });
  });
});
