import { AgentProfileFieldResolver } from './agent-profile.field.resolver.js';
import { AgentProfilesResolver } from './agent-profiles.resolver.js';

export const AGENTS_GQL_RESOLVERS = [
  AgentProfilesResolver,
  AgentProfileFieldResolver,
];
