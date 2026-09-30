import { Injectable } from '@nestjs/common';

import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import {
  KnowledgeItemRepository,
  KnowledgeKeyCounter,
} from './subdomains/knowledge/index.js';
import {
  InvitationRepository,
  MemberRepository,
  PersonalAccessTokenRepository,
  ProjectRepository,
  ProjectRoleAssignmentRepository,
  type Cleanup,
  type MemberId,
} from './subdomains/tenancy/index.js';

/**
 * The one place that knows what lies under a Workspace, a Project or a Member,
 * in every subdomain. Runs inside the caller's transaction.
 */
@Injectable()
export class CleanupAdapter implements Cleanup {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly invitationRepository: InvitationRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly projectRoleAssignmentRepository: ProjectRoleAssignmentRepository,
    private readonly personalAccessTokenRepository: PersonalAccessTokenRepository,
    private readonly knowledgeItemRepository: KnowledgeItemRepository,
    private readonly knowledgeKeyCounter: KnowledgeKeyCounter,
  ) {}

  public async afterWorkspaceDeleted(workspaceId: WorkspaceId): Promise<void> {
    await this.knowledgeItemRepository.deleteMany({ workspaceId });
    await this.knowledgeKeyCounter.deleteMany({ workspaceId });
    await this.personalAccessTokenRepository.deleteMany({ workspaceId });
    await this.projectRoleAssignmentRepository.deleteMany({ workspaceId });
    await this.projectRepository.deleteMany({ workspaceId });
    await this.invitationRepository.deleteMany({ workspaceId });
    await this.memberRepository.deleteMany({ workspaceId });
  }

  public async afterProjectDeleted(projectId: ProjectId): Promise<void> {
    await this.knowledgeItemRepository.deleteMany({ projectId });
    await this.knowledgeKeyCounter.deleteMany({ projectId });
    await this.projectRoleAssignmentRepository.deleteMany({ projectId });
  }

  /** The Member's Knowledge Items stay: they belong to the Project. */
  public async afterMemberRemoved(memberId: MemberId): Promise<void> {
    await this.projectRoleAssignmentRepository.deleteMany({ memberId });
    await this.personalAccessTokenRepository.deleteMany({ memberId });
  }
}
