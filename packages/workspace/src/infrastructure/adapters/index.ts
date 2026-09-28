import { Provider } from '@nestjs/common';

import { WorkspaceApi } from '@intentra/contracts/workspace';

import { WorkspaceApiService } from './inbound/workspace-api.service.js';

export const ADAPTERS: Provider[] = [
  WorkspaceApiService,
  { provide: WorkspaceApi, useExisting: WorkspaceApiService },
];
