import { Inject, Injectable } from '@nestjs/common';

import type { AgentsApi } from '@intentra/contracts/agents';

import {
  AgentProfilesService,
  AgentToolsService,
  ChatService,
  ModelsService,
  OpenRouterKeysService,
} from './application/services/index.js';

/** Local binding of `AgentsApi`: groups the services under one token. */
@Injectable()
export class AgentsApiService implements AgentsApi {
  constructor(
    @Inject(AgentProfilesService)
    public readonly profiles: AgentProfilesService,

    @Inject(OpenRouterKeysService)
    public readonly openRouterKeys: OpenRouterKeysService,

    @Inject(ModelsService)
    public readonly models: ModelsService,

    @Inject(AgentToolsService)
    public readonly tools: AgentToolsService,

    @Inject(ChatService)
    public readonly chat: ChatService,
  ) {}
}
