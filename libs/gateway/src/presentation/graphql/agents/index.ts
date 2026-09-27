import { AgentCatalogResolver } from './agent-catalog.resolver.js';
import { AgentProfileFieldResolver } from './agent-profile.field.resolver.js';
import { AgentProfilesResolver } from './agent-profiles.resolver.js';
import { OpenRouterKeysResolver } from './open-router-keys.resolver.js';

export const AGENTS_GQL_RESOLVERS = [
  AgentProfilesResolver,
  AgentProfileFieldResolver,
  OpenRouterKeysResolver,
  AgentCatalogResolver,
];
