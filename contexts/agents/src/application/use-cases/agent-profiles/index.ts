import { Provider } from '@nestjs/common';

import {
  CreateAgentProfileCommand,
  CreateAgentProfileCommandHandler,
} from './create-agent-profile/create-agent-profile.command.js';
import {
  DeleteAgentProfileCommand,
  DeleteAgentProfileCommandHandler,
} from './delete-agent-profile/delete-agent-profile.command.js';
import {
  EnsureOrchestratorCommand,
  EnsureOrchestratorCommandHandler,
} from './ensure-orchestrator/ensure-orchestrator.command.js';
import {
  FindManyAgentProfilesQuery,
  FindManyAgentProfilesQueryHandler,
} from './find-many-agent-profiles/find-many-agent-profiles.query.js';
import {
  GetOneAgentProfileQuery,
  GetOneAgentProfileQueryHandler,
} from './get-one-agent-profile/get-one-agent-profile.query.js';
import {
  UpdateAgentProfileCommand,
  UpdateAgentProfileCommandHandler,
} from './update-agent-profile/update-agent-profile.command.js';

export {
  CreateAgentProfileCommand,
  DeleteAgentProfileCommand,
  EnsureOrchestratorCommand,
  FindManyAgentProfilesQuery,
  GetOneAgentProfileQuery,
  UpdateAgentProfileCommand,
};

export const AGENT_PROFILES_CQRS_HANDLERS: Provider[] = [
  CreateAgentProfileCommandHandler,
  UpdateAgentProfileCommandHandler,
  DeleteAgentProfileCommandHandler,
  EnsureOrchestratorCommandHandler,
  GetOneAgentProfileQueryHandler,
  FindManyAgentProfilesQueryHandler,
];
