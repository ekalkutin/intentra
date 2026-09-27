import type { AgentProfilesApi } from './agent-profile/agent-profiles.api.js';
import type { ChatApi } from './chat/chat.api.js';
import type { ModelsApi } from './model/models.api.js';
import type { OpenRouterKeysApi } from './open-router-key/open-router-keys.api.js';
import type { AgentToolsApi } from './tool/tools.api.js';

/**
 * Published API of the Agents context. The class itself is the DI token.
 * Monolith: bound to the context's local service. Micro-services: to an HTTP
 * client.
 */
export abstract class AgentsApi {
  abstract readonly profiles: AgentProfilesApi;
  abstract readonly openRouterKeys: OpenRouterKeysApi;
  abstract readonly models: ModelsApi;
  abstract readonly tools: AgentToolsApi;
  abstract readonly chat: ChatApi;
}
