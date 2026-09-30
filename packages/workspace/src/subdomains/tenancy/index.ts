import type { Provider } from '@nestjs/common';

import { ACCESS_PROVIDERS } from './application/access/index.js';
import { APPLICATION_SERVICES } from './application/services/index.js';
import { ADAPTERS } from './infrastructure/adapters/index.js';

export {
  AccessResolver,
  type ProjectMembership,
} from './application/access/index.js';
export { ProjectNotFoundException } from './application/exceptions/index.js';
export {
  AccessService,
  InvitationsService,
  MembersService,
  PersonalAccessTokensService,
  ProjectRolesService,
  ProjectsService,
  WorkspacesService,
} from './application/services/index.js';
export {
  Cleanup,
  InvitationRepository,
  MemberRepository,
  PersonalAccessTokenRepository,
  ProjectRepository,
  ProjectRoleAssignmentRepository,
} from './application/ports/outbound/index.js';
export { Member, Project } from './domain/entities/index.js';
export { MemberId, ProjectRole } from './domain/value-objects/index.js';
export { DatabaseModule as TenancyDatabaseModule } from './infrastructure/database/index.js';

/** Who is in a Workspace and what they may do: Workspaces, Members, Roles, Invitations, Projects, Project Roles, Personal Access Tokens. */
export const TENANCY_PROVIDERS: Provider[] = [
  ...ACCESS_PROVIDERS,
  ...APPLICATION_SERVICES,
  ...ADAPTERS,
];
