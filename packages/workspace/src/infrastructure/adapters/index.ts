import { Provider } from '@nestjs/common';

import { WorkspaceApi } from '@intentra/contracts/workspace';

import { WorkspaceApiService } from './inbound/workspace-api.service.js';
import { INVITATION_REPOSITORY_PROVIDER } from './outbound/invitation-repository.adapter.js';
import { MEMBER_REPOSITORY_PROVIDER } from './outbound/member-repository.adapter.js';
import { PROJECT_REPOSITORY_PROVIDER } from './outbound/project-repository.adapter.js';
import { PROJECT_ROLE_ASSIGNMENT_REPOSITORY_PROVIDER } from './outbound/project-role-assignment-repository.adapter.js';
import { WORKSPACE_REPOSITORY_PROVIDER } from './outbound/workspace-repository.adapter.js';

export const ADAPTERS: Provider[] = [
  WorkspaceApiService,
  { provide: WorkspaceApi, useExisting: WorkspaceApiService },
  WORKSPACE_REPOSITORY_PROVIDER,
  MEMBER_REPOSITORY_PROVIDER,
  PROJECT_REPOSITORY_PROVIDER,
  INVITATION_REPOSITORY_PROVIDER,
  PROJECT_ROLE_ASSIGNMENT_REPOSITORY_PROVIDER,
];
