import type { InvitationsApi } from './invitations/invitations.api.js';
import type { MembersApi } from './members/members.api.js';
import type { ProjectsApi } from './projects/projects.api.js';
import type { WorkspacesApi } from './workspaces/workspaces.api.js';

export abstract class WorkspaceApi {
  abstract readonly workspaces: WorkspacesApi;
  abstract readonly projects: ProjectsApi;
  abstract readonly invitations: InvitationsApi;
  abstract readonly members: MembersApi;
}
