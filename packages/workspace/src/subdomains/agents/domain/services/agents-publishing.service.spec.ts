import { describe, expect, it } from 'vitest';

import { AccountId, Email } from '@intentra/shared-kernel';

import {
  agentSpec,
  profileSpec,
  TOOLS,
  unpublishedFrom,
  unpublishedWithIntentra,
} from '../entities/agents.fixtures.js';
import { UnpublishedAgents } from '../entities/index.js';
import {
  AgentsNotPublishableException,
  AgentsUnchangedException,
  UnpublishedAgentsChangedException,
} from '../exceptions/index.js';
import {
  AgentRole,
  Publisher,
  PublishingNote,
} from '../value-objects/index.js';

import { AgentsPublishingService } from './agents-publishing.service.js';

const publisher = new Publisher(
  new AccountId(),
  new Email('admin@example.com'),
);

describe('AgentsPublishingService', () => {
  const service = new AgentsPublishingService();

  /** Agents Version 1 and the Unpublished Agents right after it. */
  function publishVersionOne() {
    const unpublished = unpublishedWithIntentra();
    const versionOne = service.publish(
      unpublished,
      null,
      TOOLS,
      publisher,
      null,
    );

    return { versionOne, unpublished: unpublishedFrom(versionOne.content) };
  }

  it('publishes Agents Version 1 when nothing was published yet', () => {
    // Arrange
    const unpublished = unpublishedWithIntentra();

    // Act
    const version = service.publish(
      unpublished,
      null,
      TOOLS,
      publisher,
      new PublishingNote('Intentra'),
    );

    // Assert
    expect(version.number.value).toBe(1);
    expect(version.note?.value).toBe('Intentra');
    expect(version.publisher.email.value).toBe('admin@example.com');
  });

  it('refuses to publish Agents without Intentra', () => {
    // Arrange
    const unpublished = UnpublishedAgents.empty();
    unpublished.addModelProfile(profileSpec());

    // Act
    const publishing = () =>
      service.publish(unpublished, null, TOOLS, publisher, null);

    // Assert
    expect(publishing).toThrow(AgentsNotPublishableException);
    expect(publishing).toThrow(/exactly one Intentra/);
  });

  it('publishes the changes as the next Agents Version', () => {
    // Arrange
    const { versionOne, unpublished } = publishVersionOne();
    unpublished.addModelProfile(profileSpec('Fast'));

    // Act
    const version = service.publish(
      unpublished,
      versionOne,
      TOOLS,
      publisher,
      null,
    );

    // Assert
    expect(version.number.value).toBe(2);
  });

  it('refuses to publish nothing new', () => {
    // Arrange
    const { versionOne, unpublished } = publishVersionOne();

    // Act
    const publishing = () =>
      service.publish(unpublished, versionOne, TOOLS, publisher, null);

    // Assert
    expect(publishing).toThrow(AgentsUnchangedException);
  });

  it('refuses Agents using a tool the code no longer has', () => {
    // Arrange
    const { versionOne, unpublished } = publishVersionOne();
    unpublished.addAgent(
      AgentRole.Specialist,
      agentSpec(versionOne.content.modelProfiles[0]!.id),
      TOOLS,
    );
    const fewerTools = [TOOLS[1]!];

    // Act
    const publishing = () =>
      service.publish(unpublished, versionOne, fewerTools, publisher, null);

    // Assert
    expect(publishing).toThrow(AgentsNotPublishableException);
    expect(publishing).toThrow(/list_knowledge/);
  });

  describe('republish', () => {
    it('publishes an earlier Agents Version again as the next one', () => {
      // Arrange
      const { versionOne, unpublished } = publishVersionOne();
      unpublished.addModelProfile(profileSpec('Fast'));
      const versionTwo = service.publish(
        unpublished,
        versionOne,
        TOOLS,
        publisher,
        null,
      );

      // Act
      const versionThree = service.republish(
        unpublished,
        versionTwo,
        versionOne,
        TOOLS,
        publisher,
        null,
      );

      // Assert
      expect(versionThree.number.value).toBe(3);
      expect(versionThree.content.isSameAs(versionOne.content)).toBe(true);
      expect(unpublished.content.isSameAs(versionOne.content)).toBe(true);
    });

    it('refuses while the Unpublished Agents hold changes', () => {
      // Arrange
      const { versionOne, unpublished } = publishVersionOne();
      unpublished.addModelProfile(profileSpec('Fast'));
      const versionTwo = service.publish(
        unpublished,
        versionOne,
        TOOLS,
        publisher,
        null,
      );
      unpublished.addModelProfile(profileSpec('Smart'));

      // Act
      const republishing = () =>
        service.republish(
          unpublished,
          versionTwo,
          versionOne,
          TOOLS,
          publisher,
          null,
        );

      // Assert
      expect(republishing).toThrow(UnpublishedAgentsChangedException);
      expect(unpublished.content.modelProfiles).toHaveLength(3);
    });
  });
});
