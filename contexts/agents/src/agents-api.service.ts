import { Inject, Injectable } from '@nestjs/common';

import type { AgentsApi } from '@intentra/contracts/agents';

import { AgentProfilesService } from './application/services/index.js';

/** Local binding of `AgentsApi`: groups the services under one token. */
@Injectable()
export class AgentsApiService implements AgentsApi {
  constructor(
    @Inject(AgentProfilesService)
    public readonly profiles: AgentProfilesService,
  ) {}
}
