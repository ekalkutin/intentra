import type { AccessApi } from './access/access.api.js';
import type { ConversationsApi } from './conversations/conversations.api.js';
import type { InvitationsApi } from './invitations/invitations.api.js';
import type { KnowledgeApi } from './knowledge/knowledge.api.js';
import type { MembersApi } from './members/members.api.js';
import type { PersonalAccessTokensApi } from './personal-access-tokens/personal-access-tokens.api.js';
import type { ProjectRolesApi } from './project-roles/project-roles.api.js';
import type { ProjectsApi } from './projects/projects.api.js';
import type { ProviderKeyApi } from './provider-key/provider-key.api.js';
import type { WorkspacesApi } from './workspaces/workspaces.api.js';

export abstract class WorkspaceApi {
  abstract readonly workspaces: WorkspacesApi;
  abstract readonly projects: ProjectsApi;
  abstract readonly projectRoles: ProjectRolesApi;
  abstract readonly invitations: InvitationsApi;
  abstract readonly members: MembersApi;
  abstract readonly personalAccessTokens: PersonalAccessTokensApi;
  abstract readonly access: AccessApi;
  abstract readonly knowledge: KnowledgeApi;
  abstract readonly conversations: ConversationsApi;
  abstract readonly providerKey: ProviderKeyApi;
}
