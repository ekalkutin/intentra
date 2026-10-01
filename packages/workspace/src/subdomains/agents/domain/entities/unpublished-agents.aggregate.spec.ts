import { describe, expect, it } from 'vitest';

import {
  AgentNotFoundException,
  InvalidAgentException,
  ModelProfileInUseException,
  OrchestratorExistsException,
  OrchestratorNotRemovableException,
  SkillNameTakenException,
} from '../exceptions/index.js';
import {
  AgentRole,
  AgentsChangeKind,
  ModelProfileId,
  ToolName,
} from '../value-objects/index.js';

import {
  agentSpec,
  orchestratorOf,
  profileSpec,
  skillSpec,
  TOOLS,
  unpublishedWithOrchestrator,
} from './agents.fixtures.js';

describe('UnpublishedAgents', () => {
  describe('addAgent', () => {
    it('adds a Specialist on an existing Model Profile', () => {
      // Arrange
      const unpublished = unpublishedWithOrchestrator();
      const content = unpublished.content;

      // Act
      const specialist = unpublished.addAgent(
        AgentRole.Specialist,
        agentSpec(content.modelProfiles[0]!.id),
        TOOLS,
      );

      // Assert
      expect(specialist.isOrchestrator()).toBe(false);
      expect(unpublished.content.agents).toHaveLength(2);
    });

    it('refuses a second Orchestrator', () => {
      // Arrange
      const unpublished = unpublishedWithOrchestrator();
      const spec = agentSpec(unpublished.content.modelProfiles[0]!.id);

      // Act
      const adding = () =>
        unpublished.addAgent(AgentRole.Orchestrator, spec, TOOLS);

      // Assert
      expect(adding).toThrow(OrchestratorExistsException);
    });

    it('refuses a tool the code does not have', () => {
      // Arrange
      const unpublished = unpublishedWithOrchestrator();
      const content = unpublished.content;
      const spec = agentSpec(content.modelProfiles[0]!.id, {
        tools: [new ToolName('send_email')],
      });

      // Act
      const adding = () =>
        unpublished.addAgent(AgentRole.Specialist, spec, TOOLS);

      // Assert
      expect(adding).toThrow(InvalidAgentException);
    });

    it('refuses a Specialist that would call other Agents', () => {
      // Arrange
      const unpublished = unpublishedWithOrchestrator();
      const content = unpublished.content;
      const versionOne = unpublished.addAgent(
        AgentRole.Specialist,
        agentSpec(content.modelProfiles[0]!.id),
        TOOLS,
      );
      const spec = agentSpec(content.modelProfiles[0]!.id, {
        specialistIds: [versionOne.id],
      });

      // Act
      const adding = () =>
        unpublished.addAgent(AgentRole.Specialist, spec, TOOLS);

      // Assert
      expect(adding).toThrow(InvalidAgentException);
    });

    it('refuses a Model Profile that does not exist', () => {
      // Arrange
      const unpublished = unpublishedWithOrchestrator();

      // Act
      const adding = () =>
        unpublished.addAgent(
          AgentRole.Specialist,
          agentSpec(new ModelProfileId()),
          TOOLS,
        );

      // Assert
      expect(adding).toThrow();
    });
  });

  describe('removeAgent', () => {
    it('takes a removed Specialist away from the Orchestrator', () => {
      // Arrange
      const unpublished = unpublishedWithOrchestrator();
      const content = unpublished.content;
      const profileId = content.modelProfiles[0]!.id;
      const specialist = unpublished.addAgent(
        AgentRole.Specialist,
        agentSpec(profileId),
        TOOLS,
      );
      const orchestrator = orchestratorOf(content);
      unpublished.editAgent(
        orchestrator.id,
        agentSpec(profileId, { specialistIds: [specialist.id] }),
        TOOLS,
      );

      // Act
      unpublished.removeAgent(specialist.id);

      // Assert
      expect(orchestratorOf(unpublished.content).specialistIds).toEqual([]);
      expect(() => unpublished.getAgent(specialist.id)).toThrow(
        AgentNotFoundException,
      );
    });

    it('never removes the Orchestrator', () => {
      // Arrange
      const unpublished = unpublishedWithOrchestrator();
      const content = unpublished.content;

      // Act
      const removing = () =>
        unpublished.removeAgent(orchestratorOf(content).id);

      // Assert
      expect(removing).toThrow(OrchestratorNotRemovableException);
    });
  });

  describe('Skills', () => {
    it('refuses a second Skill with the same name', () => {
      // Arrange
      const unpublished = unpublishedWithOrchestrator();
      unpublished.addSkill(skillSpec());

      // Act
      const adding = () => unpublished.addSkill(skillSpec());

      // Assert
      expect(adding).toThrow(SkillNameTakenException);
    });

    it('takes a deleted Skill away from every Agent', () => {
      // Arrange
      const unpublished = unpublishedWithOrchestrator();
      const content = unpublished.content;
      const skill = unpublished.addSkill(skillSpec());
      const orchestrator = orchestratorOf(content);
      unpublished.editAgent(
        orchestrator.id,
        agentSpec(content.modelProfiles[0]!.id, { skillIds: [skill.id] }),
        TOOLS,
      );

      // Act
      unpublished.removeSkill(skill.id);

      // Assert
      expect(unpublished.content.skills).toEqual([]);
      expect(orchestratorOf(unpublished.content).skillIds).toEqual([]);
    });
  });

  describe('removeModelProfile', () => {
    it('refuses while an Agent is on it, naming the Agent', () => {
      // Arrange
      const unpublished = unpublishedWithOrchestrator();
      const content = unpublished.content;

      // Act
      const removing = () =>
        unpublished.removeModelProfile(content.modelProfiles[0]!.id);

      // Assert
      expect(removing).toThrow(ModelProfileInUseException);
      expect(removing).toThrow(/Orchestrator/);
    });

    it('removes one no Agent is on', () => {
      // Arrange
      const unpublished = unpublishedWithOrchestrator();
      const spare = unpublished.addModelProfile(profileSpec('Fast'));

      // Act
      unpublished.removeModelProfile(spare.id);

      // Assert
      expect(unpublished.content.modelProfiles).toHaveLength(1);
    });
  });

  describe('changes', () => {
    it('lists what was added, changed and removed against the Published Agents', () => {
      // Arrange
      const unpublished = unpublishedWithOrchestrator();
      const content = unpublished.content;
      const fast = unpublished.addModelProfile(profileSpec('Fast'));
      const orchestrator = orchestratorOf(content);
      unpublished.editAgent(
        orchestrator.id,
        agentSpec(fast.id, {
          name: orchestrator.name,
          description: orchestrator.description,
          instructions: orchestrator.instructions,
          tools: orchestrator.tools,
        }),
        TOOLS,
      );

      // Act
      const changes = unpublished.content.changesSince(content);

      // Assert
      expect(changes.agents).toEqual([
        {
          id: orchestrator.id.value,
          name: 'Orchestrator',
          kind: AgentsChangeKind.Changed,
          fields: ['modelProfileId'],
        },
      ]);
      expect(changes.modelProfiles).toEqual([
        {
          id: fast.id.value,
          name: 'Fast',
          kind: AgentsChangeKind.Added,
          fields: [],
        },
      ]);
    });
  });
});
