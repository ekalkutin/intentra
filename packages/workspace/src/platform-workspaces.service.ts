import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type {
  DeleteWorkspaceDto,
  OpenWorkspaceCreationDto,
  PlatformWorkspaceDto,
  PlatformWorkspacesApi,
} from '@intentra/contracts/workspace';
import {
  AccountId,
  NotPlatformAdminException,
  UnitOfWork,
  WorkspaceId,
} from '@intentra/shared-kernel';

import { ProviderKeyRepository } from './subdomains/agents/index.js';
import {
  Cleanup,
  MemberRepository,
  MemberStatus,
  PersonalAccessTokenRepository,
  ProjectRepository,
  WorkspaceCreationSettingsRepository,
  WorkspaceDeletionService,
  WorkspaceRepository,
} from './subdomains/tenancy/index.js';

/**
 * A Platform Admin's view of Workspaces from outside: what describes them,
 * never what is in them. It spans Tenancy and Agents, so it lives here, like
 * the cleanup.
 */
@Injectable()
export class PlatformWorkspacesService implements PlatformWorkspacesApi {
  readonly #workspaceDeletionService = new WorkspaceDeletionService();

  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly memberRepository: MemberRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly personalAccessTokenRepository: PersonalAccessTokenRepository,
    private readonly providerKeyRepository: ProviderKeyRepository,
    private readonly cleanup: Cleanup,
    private readonly workspaceCreationSettingsRepository: WorkspaceCreationSettingsRepository,
  ) {}

  public async list(actor: Actor): Promise<PlatformWorkspaceDto[]> {
    ensurePlatformAdmin(actor);
    const workspaces = await this.workspaceRepository.findMany({});

    return Promise.all(
      workspaces.map(async workspace => {
        const members = await this.memberRepository.findMany({
          workspaceId: workspace.id,
          status: MemberStatus.Active,
        });
        const projects = await this.projectRepository.findMany({
          workspaceId: workspace.id,
        });
        const providerKey = await this.providerKeyRepository.findOne({
          workspaceId: workspace.id,
        });

        return {
          id: workspace.id.value,
          name: workspace.name.value,
          slug: workspace.slug.value,
          suspended: workspace.isSuspended,
          owners: members
            .filter(member => member.isOwner())
            .map(member => member.email.value),
          membersCount: members.length,
          projectsCount: projects.length,
          hasProviderKey: providerKey !== null,
        };
      }),
    );
  }

  public async suspend(actor: Actor, workspaceId: string): Promise<void> {
    ensurePlatformAdmin(actor);
    const id = new WorkspaceId(workspaceId);

    await this.unitOfWork.run(async () => {
      const workspace = await this.workspaceRepository.getOne({ id });
      workspace.suspend();
      await this.workspaceRepository.save(workspace);
    });
  }

  public async resume(actor: Actor, workspaceId: string): Promise<void> {
    ensurePlatformAdmin(actor);
    const id = new WorkspaceId(workspaceId);

    await this.unitOfWork.run(async () => {
      const workspace = await this.workspaceRepository.getOne({ id });
      workspace.resume();
      await this.workspaceRepository.save(workspace);
    });
  }

  public async delete(
    actor: Actor,
    workspaceId: string,
    data: DeleteWorkspaceDto,
  ): Promise<void> {
    ensurePlatformAdmin(actor);
    const id = new WorkspaceId(workspaceId);

    await this.unitOfWork.run(async () => {
      await this.workspaceRepository.lock(id);
      const workspace = await this.workspaceRepository.getOne({ id });

      this.#workspaceDeletionService.ensureDeletableByPlatformAdmin(workspace, {
        slug: data.slug,
      });
      await this.workspaceRepository.delete(id);
      await this.cleanup.afterWorkspaceDeleted(id);
    });
  }

  public async revokeAccountTokens(
    actor: Actor,
    accountId: string,
  ): Promise<void> {
    ensurePlatformAdmin(actor);
    const members = await this.memberRepository.findMany({
      accountId: new AccountId(accountId),
    });

    await this.unitOfWork.run(async () => {
      for (const member of members) {
        await this.personalAccessTokenRepository.deleteMany({
          memberId: member.id,
        });
      }
    });
  }

  public async getCreation(actor: Actor): Promise<OpenWorkspaceCreationDto> {
    ensurePlatformAdmin(actor);
    const settings = await this.workspaceCreationSettingsRepository.getOne();

    return { open: settings.isOpen };
  }

  public async setCreation(
    actor: Actor,
    data: OpenWorkspaceCreationDto,
  ): Promise<OpenWorkspaceCreationDto> {
    ensurePlatformAdmin(actor);

    return this.unitOfWork.run(async () => {
      const settings = await this.workspaceCreationSettingsRepository.getOne();
      if (data.open) {
        settings.open();
      } else {
        settings.close();
      }
      await this.workspaceCreationSettingsRepository.save(settings);

      return { open: settings.isOpen };
    });
  }
}

function ensurePlatformAdmin(actor: Actor): void {
  if (!actor.isPlatformAdmin) {
    throw new NotPlatformAdminException();
  }
}
