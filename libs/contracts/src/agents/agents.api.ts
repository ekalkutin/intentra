import type { AgentProfilesApi } from './agent-profile/agent-profiles.api.js';

/**
 * Published API of the Agents context. The class itself is the DI token.
 * Monolith: bound to the context's local service. Micro-services: to an HTTP
 * client.
 */
export abstract class AgentsApi {
  abstract readonly profiles: AgentProfilesApi;
}
