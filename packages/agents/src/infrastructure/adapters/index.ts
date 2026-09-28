import { Provider } from '@nestjs/common';

import { AgentsApi } from '@intentra/contracts/agents';

import { AgentsApiService } from './inbound/agents-api.service.js';

export const ADAPTERS: Provider[] = [
  AgentsApiService,
  { provide: AgentsApi, useExisting: AgentsApiService },
];
