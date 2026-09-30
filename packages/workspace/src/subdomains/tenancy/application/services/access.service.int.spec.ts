import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { Actor } from '@intentra/contracts/iam';
import { TestingApp } from '@intentra/platform-testing';
import { AccountId, UnitOfWork } from '@intentra/shared-kernel';

import { WorkspaceModule } from '../../../../workspace.module.js';
import { Member } from '../../domain/entities/index.js';
import { Role } from '../../domain/value-objects/index.js';
import { WorkspaceNotFoundException } from '../exceptions/index.js';
import { MemberRepository } from '../ports/outbound/index.js';

import { AccessService } from './access.service.js';
import { ProjectRolesService } from './project-roles.service.js';
import { ProjectsService } from './projects.service.js';
import { WorkspacesService } from './workspaces.service.js';

function actor(email: string): Actor {
  return { accountId: new AccountId().value, email };
}

describe('AccessService integration', () => {
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

  /** Ada owns the Workspace and the Project; Bob joins with the given Role. */
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

  it('lets an Owner do everything', async () => {
    // Arrange
    const { workspaceId, projectId, ada } = await setUp();

    // Act
    const access = await app.get(AccessService).get(ada, workspaceId);

    // Assert
    expect(access).toEqual({
      memberId: expect.any(String),
      role: 'owner',
      canManageInvitations: true,
      canManageMembers: true,
      canCreateProjects: true,
      canDeleteWorkspace: true,
      canSeeAllPersonalAccessTokens: true,
      projects: {
        [projectId]: {
          role: 'maintainer',
          canChangeProjectRoles: true,
          canDelete: true,
        },
      },
    });
  });

  it('shows a Member without a Role as a Viewer who manages nothing', async () => {
    // Arrange
    const { workspaceId, projectId, bob, bobId } = await setUp();

    // Act
    const access = await app.get(AccessService).get(bob, workspaceId);

    // Assert
    expect(access).toEqual({
      memberId: bobId,
      role: null,
      canManageInvitations: false,
      canManageMembers: false,
      canCreateProjects: false,
      canDeleteWorkspace: false,
      canSeeAllPersonalAccessTokens: false,
      projects: {
        [projectId]: {
          role: 'viewer',
          canChangeProjectRoles: false,
          canDelete: false,
        },
      },
    });
  });

  it('follows the Project Role given in each Project', async () => {
    // Arrange
    const { workspaceId, projectId, ada, bob, bobId } = await setUp();
    await app
      .get(ProjectRolesService)
      .change(ada, workspaceId, projectId, bobId, { role: 'maintainer' });

    // Act
    const access = await app.get(AccessService).get(bob, workspaceId);

    // Assert
    expect(access.projects[projectId]).toEqual({
      role: 'maintainer',
      canChangeProjectRoles: true,
      canDelete: false,
    });
  });

  it('lets a Manager delete only the Projects they created', async () => {
    // Arrange
    const { workspaceId, projectId, bob } = await setUp(Role.Manager);
    const own = await app
      .get(ProjectsService)
      .create(bob, workspaceId, { name: 'Web', slug: 'web' });

    // Act
    const access = await app.get(AccessService).get(bob, workspaceId);

    // Assert
    expect(access.canCreateProjects).toBe(true);
    expect(access.projects[own.id]?.canDelete).toBe(true);
    expect(access.projects[projectId]?.canDelete).toBe(false);
  });

  it('reports a Workspace the caller is not in as not found', async () => {
    // Arrange
    const { workspaceId } = await setUp();

    // Act
    const getting = app
      .get(AccessService)
      .get(actor('eve@example.com'), workspaceId);

    // Assert
    await expect(getting).rejects.toBeInstanceOf(WorkspaceNotFoundException);
  });
});
