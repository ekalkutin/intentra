import { AGENT_ROLE } from '@intentra/contracts/agents';

import type { AgentProfilesQuery } from '../api/__generated__/agent-profiles.query.generated';

export type AgentProfile = AgentProfilesQuery['agentProfiles'][number];

export const isOrchestrator = (profile: AgentProfile): boolean =>
  profile.role === AGENT_ROLE.ORCHESTRATOR;
