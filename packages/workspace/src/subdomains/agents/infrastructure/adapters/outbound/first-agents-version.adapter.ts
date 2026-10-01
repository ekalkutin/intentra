import { Inject, Injectable, Provider } from '@nestjs/common';

import {
  AGENT_TOOLS,
  ORCHESTRATOR_DESCRIPTION,
  ORCHESTRATOR_INSTRUCTIONS,
} from '@intentra/agent-toolkit';

import { FirstAgentsVersion } from '../../../application/ports/outbound/index.js';
import {
  Agent,
  AgentsContent,
  ModelProfile,
} from '../../../domain/entities/index.js';
import {
  AgentDescription,
  AgentId,
  AgentInstructions,
  AgentName,
  AgentRole,
  ModelId,
  ModelProfileId,
  ModelProfileName,
  ToolName,
} from '../../../domain/value-objects/index.js';
import { AGENTS_OPTIONS, type AgentsOptions } from '../../runtime/index.js';

/**
 * The Orchestrator with the instructions and every tool it had in the code,
 * on one built-in Model Profile with the configured model.
 */
@Injectable()
export class FirstAgentsVersionAdapter extends FirstAgentsVersion {
  constructor(@Inject(AGENTS_OPTIONS) private readonly options: AgentsOptions) {
    super();
  }

  public content(): AgentsContent {
    const profile = ModelProfile.create(new ModelProfileId(), {
      name: new ModelProfileName('Default'),
      modelId: new ModelId(this.options.firstModelId),
      temperature: null,
      reasoningEffort: null,
      maxOutputTokens: null,
    });
    const orchestrator = Agent.create(new AgentId(), AgentRole.Orchestrator, {
      name: new AgentName('Orchestrator'),
      description: new AgentDescription(ORCHESTRATOR_DESCRIPTION),
      instructions: new AgentInstructions(ORCHESTRATOR_INSTRUCTIONS),
      tools: Object.keys(AGENT_TOOLS).map(id => new ToolName(id)),
      skillIds: [],
      modelProfileId: profile.id,
      specialistIds: [],
    });

    return new AgentsContent([orchestrator], [], [profile]);
  }
}

export const FIRST_AGENTS_VERSION_PROVIDER: Provider = {
  provide: FirstAgentsVersion,
  useClass: FirstAgentsVersionAdapter,
};
