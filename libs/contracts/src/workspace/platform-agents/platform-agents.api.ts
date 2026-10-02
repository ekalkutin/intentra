import type { Actor } from '../../iam/index.js';

import type { AgentToolDto } from './agent-tool.dto.js';
import type { AgentsChangesDto } from './agents-changes.dto.js';
import type {
  ModelProfileDto,
  PlatformAgentDto,
  SkillDto,
} from './agents-content.dto.js';
import type {
  AgentsVersionDto,
  AgentsVersionSummaryDto,
  UnpublishedAgentsDto,
} from './agents-version.dto.js';
import type { PublishAgentsDto } from './publish-agents.dto.js';
import type { CreateAgentDto, SaveAgentDto } from './save-agent.dto.js';
import type { SaveModelProfileDto } from './save-model-profile.dto.js';
import type { SaveSkillDto } from './save-skill.dto.js';

/**
 * Intentra's Agents as a Platform Admin designs them: the Unpublished Agents,
 * edited one object at a time, and the Agents Versions they publish. Anyone
 * else gets 403 `NOT_PLATFORM_ADMIN`.
 */
export abstract class PlatformAgentsApi {
  abstract getUnpublished(actor: Actor): Promise<UnpublishedAgentsDto>;

  /** 409 `INTENTRA_EXISTS` for a second Intentra, `AUDITOR_EXISTS` for a second Auditor. */
  abstract createAgent(
    actor: Actor,
    data: CreateAgentDto,
  ): Promise<PlatformAgentDto>;
  abstract editAgent(
    actor: Actor,
    agentId: string,
    data: SaveAgentDto,
  ): Promise<PlatformAgentDto>;
  /** Removes a Specialist, and takes it away from Intentra. */
  abstract deleteAgent(actor: Actor, agentId: string): Promise<void>;

  abstract createSkill(actor: Actor, data: SaveSkillDto): Promise<SkillDto>;
  abstract editSkill(
    actor: Actor,
    skillId: string,
    data: SaveSkillDto,
  ): Promise<SkillDto>;
  /** Takes the Skill away from every Agent that had it. */
  abstract deleteSkill(actor: Actor, skillId: string): Promise<void>;

  abstract createModelProfile(
    actor: Actor,
    data: SaveModelProfileDto,
  ): Promise<ModelProfileDto>;
  abstract editModelProfile(
    actor: Actor,
    modelProfileId: string,
    data: SaveModelProfileDto,
  ): Promise<ModelProfileDto>;
  /** 409 `MODEL_PROFILE_IN_USE`, naming the Agents, while any Agent is on it. */
  abstract deleteModelProfile(
    actor: Actor,
    modelProfileId: string,
  ): Promise<void>;

  /** The tools the code offers, to pick an Agent's tools from. */
  abstract listTools(actor: Actor): Promise<AgentToolDto[]>;

  /** What publishing now would change against the Published Agents. */
  abstract getChanges(actor: Actor): Promise<AgentsChangesDto>;

  /**
   * Publishes the Unpublished Agents as the next Agents Version (Agents
   * Version 1 the first time), after checking them as a whole. Until then
   * no Workspace's Agents work.
   */
  abstract publish(
    actor: Actor,
    data: PublishAgentsDto,
  ): Promise<AgentsVersionSummaryDto>;

  /** Newest first. */
  abstract listVersions(actor: Actor): Promise<AgentsVersionSummaryDto[]>;
  abstract getVersion(actor: Actor, number: number): Promise<AgentsVersionDto>;

  /**
   * Publishes an earlier Agents Version again as the next one; the
   * Unpublished Agents become it too. Refused while the Unpublished Agents
   * hold changes, so none are lost (409 `UNPUBLISHED_AGENTS_CHANGED`).
   */
  abstract republish(
    actor: Actor,
    number: number,
    data: PublishAgentsDto,
  ): Promise<AgentsVersionSummaryDto>;
}
