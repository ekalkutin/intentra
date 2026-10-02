import { describe, expect, it } from 'vitest';

import {
  AgentNotFoundException,
  IntentraExistsException,
  IntentraNotRemovableException,
  InvalidAgentException,
  ModelProfileInUseException,
  SkillNameTakenException,
} from '../exceptions/index.js';
import {
  AgentRole,
  AgentsChangeKind,
  ModelProfileId,
  PublishingProblemKind,
  ToolName,
} from '../value-objects/index.js';

import {
  agentSpec,
  intentraOf,
  profileSpec,
  skillSpec,
  TOOLS,
  unpublishedWithIntentra,
} from './agents.fixtures.js';

describe('UnpublishedAgents', () => {
  describe('addAgent', () => {
    it('adds a Specialist on an existing Model Profile', () => {
      // Arrange
      const unpublished = unpublishedWithIntentra();
      const content = unpublished.content;

      // Act
      const specialist = unpublished.addAgent(
        AgentRole.Specialist,
        agentSpec(content.modelProfiles[0]!.id),
        TOOLS,
      );

      // Assert
      expect(specialist.isIntentra()).toBe(false);
      expect(unpublished.content.agents).toHaveLength(2);
    });

    it('refuses a second Intentra', () => {
      // Arrange
      const unpublished = unpublishedWithIntentra();
      const spec = agentSpec(unpublished.content.modelProfiles[0]!.id);

      // Act
      const adding = () =>
        unpublished.addAgent(AgentRole.Intentra, spec, TOOLS);

      // Assert
      expect(adding).toThrow(IntentraExistsException);
    });

    it('refuses a tool the code does not have', () => {
      // Arrange
      const unpublished = unpublishedWithIntentra();
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
      const unpublished = unpublishedWithIntentra();
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
      const unpublished = unpublishedWithIntentra();

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
    it('takes a removed Specialist away from Intentra', () => {
      // Arrange
      const unpublished = unpublishedWithIntentra();
      const content = unpublished.content;
      const profileId = content.modelProfiles[0]!.id;
      const specialist = unpublished.addAgent(
        AgentRole.Specialist,
        agentSpec(profileId),
        TOOLS,
      );
      const intentra = intentraOf(content);
      unpublished.editAgent(
        intentra.id,
        agentSpec(profileId, { specialistIds: [specialist.id] }),
        TOOLS,
      );

      // Act
      unpublished.removeAgent(specialist.id);

      // Assert
      expect(intentraOf(unpublished.content).specialistIds).toEqual([]);
      expect(() => unpublished.getAgent(specialist.id)).toThrow(
        AgentNotFoundException,
      );
    });

    it('never removes Intentra', () => {
      // Arrange
      const unpublished = unpublishedWithIntentra();
      const content = unpublished.content;

      // Act
      const removing = () => unpublished.removeAgent(intentraOf(content).id);

      // Assert
      expect(removing).toThrow(IntentraNotRemovableException);
    });
  });

  describe('Skills', () => {
    it('refuses a second Skill with the same name', () => {
      // Arrange
      const unpublished = unpublishedWithIntentra();
      unpublished.addSkill(skillSpec());

      // Act
      const adding = () => unpublished.addSkill(skillSpec());

      // Assert
      expect(adding).toThrow(SkillNameTakenException);
    });

    it('takes a deleted Skill away from every Agent', () => {
      // Arrange
      const unpublished = unpublishedWithIntentra();
      const content = unpublished.content;
      const skill = unpublished.addSkill(skillSpec());
      const intentra = intentraOf(content);
      unpublished.editAgent(
        intentra.id,
        agentSpec(content.modelProfiles[0]!.id, { skillIds: [skill.id] }),
        TOOLS,
      );

      // Act
      unpublished.removeSkill(skill.id);

      // Assert
      expect(unpublished.content.skills).toEqual([]);
      expect(intentraOf(unpublished.content).skillIds).toEqual([]);
    });
  });

  describe('removeModelProfile', () => {
    it('refuses while an Agent is on it, naming the Agent', () => {
      // Arrange
      const unpublished = unpublishedWithIntentra();
      const content = unpublished.content;

      // Act
      const removing = () =>
        unpublished.removeModelProfile(content.modelProfiles[0]!.id);

      // Assert
      expect(removing).toThrow(ModelProfileInUseException);
      expect(removing).toThrow(/Intentra/);
    });

    it('removes one no Agent is on', () => {
      // Arrange
      const unpublished = unpublishedWithIntentra();
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
      const unpublished = unpublishedWithIntentra();
      const content = unpublished.content;
      const fast = unpublished.addModelProfile(profileSpec('Fast'));
      const intentra = intentraOf(content);
      unpublished.editAgent(
        intentra.id,
        agentSpec(fast.id, {
          name: intentra.name,
          description: intentra.description,
          instructions: intentra.instructions,
          tools: intentra.tools,
        }),
        TOOLS,
      );

      // Act
      const changes = unpublished.content.changesSince(content);

      // Assert
      expect(changes.agents).toEqual([
        {
          id: intentra.id.value,
          name: 'Intentra',
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

  describe('problems', () => {
    it('names the Agent and the tool when the code no longer has a tool', () => {
      // Arrange
      const unpublished = unpublishedWithIntentra();
      const intentra = intentraOf(unpublished.content);
      const remaining = [TOOLS[1]!];

      // Act
      const problems = unpublished.content.problems(remaining);

      // Assert
      expect(problems).toHaveLength(1);
      expect(problems[0]!.kind).toBe(PublishingProblemKind.ToolUnavailable);
      expect(problems[0]!.subject).toEqual({
        id: intentra.id.value,
        name: 'Intentra',
      });
      expect(problems[0]!.tool).toBe('list_knowledge');
    });

    it('finds nothing in Agents that could be published', () => {
      // Arrange
      const unpublished = unpublishedWithIntentra();

      // Act
      const problems = unpublished.content.problems(TOOLS);

      // Assert
      expect(problems).toEqual([]);
    });
  });
});
