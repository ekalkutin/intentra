import { describe, expect, it } from 'vitest';

import {
  AgentNotFoundException,
  InvalidAgentException,
  ModelProfileInUseException,
  OrchestratorNotRemovableException,
  SkillNameTakenException,
} from '../exceptions/index.js';
import {
  AgentsChangeKind,
  ModelProfileId,
  ToolName,
} from '../value-objects/index.js';

import {
  agentSpec,
  firstContent,
  orchestratorOf,
  profileSpec,
  skillSpec,
  TOOLS,
  unpublishedFrom,
} from './agents.fixtures.js';

describe('UnpublishedAgents', () => {
  describe('addSpecialist', () => {
    it('adds a Specialist on an existing Model Profile', () => {
      // Arrange
      const content = firstContent();
      const unpublished = unpublishedFrom(content);

      // Act
      const specialist = unpublished.addSpecialist(
        agentSpec(content.modelProfiles[0]!.id),
        TOOLS,
      );

      // Assert
      expect(specialist.isOrchestrator()).toBe(false);
      expect(unpublished.content.agents).toHaveLength(2);
    });

    it('refuses a tool the code does not have', () => {
      // Arrange
      const content = firstContent();
      const unpublished = unpublishedFrom(content);
      const spec = agentSpec(content.modelProfiles[0]!.id, {
        tools: [new ToolName('send_email')],
      });

      // Act
      const adding = () => unpublished.addSpecialist(spec, TOOLS);

      // Assert
      expect(adding).toThrow(InvalidAgentException);
    });

    it('refuses a Specialist that would call other Agents', () => {
      // Arrange
      const content = firstContent();
      const unpublished = unpublishedFrom(content);
      const first = unpublished.addSpecialist(
        agentSpec(content.modelProfiles[0]!.id),
        TOOLS,
      );
      const spec = agentSpec(content.modelProfiles[0]!.id, {
        specialistIds: [first.id],
      });

      // Act
      const adding = () => unpublished.addSpecialist(spec, TOOLS);

      // Assert
      expect(adding).toThrow(InvalidAgentException);
    });

    it('refuses a Model Profile that does not exist', () => {
      // Arrange
      const unpublished = unpublishedFrom(firstContent());

      // Act
      const adding = () =>
        unpublished.addSpecialist(agentSpec(new ModelProfileId()), TOOLS);

      // Assert
      expect(adding).toThrow();
    });
  });

  describe('removeAgent', () => {
    it('takes a removed Specialist away from the Orchestrator', () => {
      // Arrange
      const content = firstContent();
      const unpublished = unpublishedFrom(content);
      const profileId = content.modelProfiles[0]!.id;
      const specialist = unpublished.addSpecialist(agentSpec(profileId), TOOLS);
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
      const content = firstContent();
      const unpublished = unpublishedFrom(content);

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
      const unpublished = unpublishedFrom(firstContent());
      unpublished.addSkill(skillSpec());

      // Act
      const adding = () => unpublished.addSkill(skillSpec());

      // Assert
      expect(adding).toThrow(SkillNameTakenException);
    });

    it('takes a deleted Skill away from every Agent', () => {
      // Arrange
      const content = firstContent();
      const unpublished = unpublishedFrom(content);
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
      const content = firstContent();
      const unpublished = unpublishedFrom(content);

      // Act
      const removing = () =>
        unpublished.removeModelProfile(content.modelProfiles[0]!.id);

      // Assert
      expect(removing).toThrow(ModelProfileInUseException);
      expect(removing).toThrow(/Orchestrator/);
    });

    it('removes one no Agent is on', () => {
      // Arrange
      const unpublished = unpublishedFrom(firstContent());
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
      const content = firstContent();
      const unpublished = unpublishedFrom(content);
      const fast = unpublished.addModelProfile(profileSpec('Fast'));
      const orchestrator = orchestratorOf(content);
      unpublished.editAgent(
        orchestrator.id,
        agentSpec(fast.id, { name: orchestrator.name }),
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
