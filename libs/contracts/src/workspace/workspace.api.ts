import type { InvitationsApi } from './invitations/invitations.api.js';
import type { MembersApi } from './members/members.api.js';
import type { ProjectRolesApi } from './project-roles/project-roles.api.js';
import type { ProjectsApi } from './projects/projects.api.js';
import type { WorkspacesApi } from './workspaces/workspaces.api.js';

export abstract class WorkspaceApi {
  abstract readonly workspaces: WorkspacesApi;
  abstract readonly projects: ProjectsApi;
  abstract readonly projectRoles: ProjectRolesApi;
  abstract readonly invitations: InvitationsApi;
  abstract readonly members: MembersApi;
}
