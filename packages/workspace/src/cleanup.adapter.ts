import { Injectable } from '@nestjs/common';

import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import {
  AnalysisRunRepository,
  AnalysisScheduleRepository,
  ConversationStore,
  ProviderKeyRepository,
} from './subdomains/agents/index.js';
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
 * in every subdomain. Runs inside the caller's transaction; Conversations are
 * kept by the Agents' runtime outside it, so a rolled-back deletion still
 * loses them (Agents ADR 0002).
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
    private readonly conversationStore: ConversationStore,
    private readonly providerKeyRepository: ProviderKeyRepository,
    private readonly analysisRunRepository: AnalysisRunRepository,
    private readonly analysisScheduleRepository: AnalysisScheduleRepository,
  ) {}

  public async afterWorkspaceDeleted(workspaceId: WorkspaceId): Promise<void> {
    await this.conversationStore.deleteMany({ workspaceId });
    await this.providerKeyRepository.deleteMany({ workspaceId });
    await this.analysisRunRepository.deleteMany({ workspaceId });
    await this.analysisScheduleRepository.deleteMany({ workspaceId });
    await this.knowledgeItemRepository.deleteMany({ workspaceId });
    await this.knowledgeKeyCounter.deleteMany({ workspaceId });
    await this.personalAccessTokenRepository.deleteMany({ workspaceId });
    await this.projectRoleAssignmentRepository.deleteMany({ workspaceId });
    await this.projectRepository.deleteMany({ workspaceId });
    await this.invitationRepository.deleteMany({ workspaceId });
    await this.memberRepository.deleteMany({ workspaceId });
  }

  public async afterProjectDeleted(projectId: ProjectId): Promise<void> {
    await this.conversationStore.deleteMany({ projectId });
    await this.analysisRunRepository.deleteMany({ projectId });
    await this.analysisScheduleRepository.deleteMany({ projectId });
    await this.knowledgeItemRepository.deleteMany({ projectId });
    await this.knowledgeKeyCounter.deleteMany({ projectId });
    await this.projectRoleAssignmentRepository.deleteMany({ projectId });
  }

  /** The Member's Knowledge Items and the Analysis Runs they started stay: they belong to the Project. Their Conversations go. */
  public async afterMemberRemoved(memberId: MemberId): Promise<void> {
    await this.conversationStore.deleteMany({ memberId });
    await this.projectRoleAssignmentRepository.deleteMany({ memberId });
    await this.personalAccessTokenRepository.deleteMany({ memberId });
  }
}
