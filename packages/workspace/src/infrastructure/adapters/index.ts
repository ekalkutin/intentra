import { Provider } from '@nestjs/common';

import { WorkspaceApi } from '@intentra/contracts/workspace';

import { WorkspaceApiService } from './inbound/workspace-api.service.js';
import { MEMBER_REPOSITORY_PROVIDER } from './outbound/member-repository.adapter.js';
import { WORKSPACE_REPOSITORY_PROVIDER } from './outbound/workspace-repository.adapter.js';

export const ADAPTERS: Provider[] = [
  WorkspaceApiService,
  { provide: WorkspaceApi, useExisting: WorkspaceApiService },
  WORKSPACE_REPOSITORY_PROVIDER,
  MEMBER_REPOSITORY_PROVIDER,
];
