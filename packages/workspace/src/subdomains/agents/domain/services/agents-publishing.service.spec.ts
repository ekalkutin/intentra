import { describe, expect, it } from 'vitest';

import { AccountId, Email } from '@intentra/shared-kernel';

import {
  agentSpec,
  firstContent,
  profileSpec,
  TOOLS,
  unpublishedFrom,
} from '../entities/agents.fixtures.js';
import { AgentsVersion } from '../entities/index.js';
import {
  AgentsNotPublishableException,
  AgentsUnchangedException,
  UnpublishedAgentsChangedException,
} from '../exceptions/index.js';
import { Publisher, PublishingNote } from '../value-objects/index.js';

import { AgentsPublishingService } from './agents-publishing.service.js';

const publisher = new Publisher(
  new AccountId(),
  new Email('admin@example.com'),
);

describe('AgentsPublishingService', () => {
  const service = new AgentsPublishingService();

  it('publishes the changes as the next Agents Version', () => {
    // Arrange
    const first = AgentsVersion.first(firstContent());
    const unpublished = unpublishedFrom(first.content);
    unpublished.addModelProfile(profileSpec('Fast'));

    // Act
    const version = service.publish(
      unpublished,
      first,
      TOOLS,
      publisher,
      new PublishingNote('A faster profile'),
    );

    // Assert
    expect(version.number.value).toBe(2);
    expect(version.note?.value).toBe('A faster profile');
    expect(version.publisher?.email.value).toBe('admin@example.com');
    expect(unpublished.publishedNumber.value).toBe(2);
  });

  it('refuses to publish nothing new', () => {
    // Arrange
    const first = AgentsVersion.first(firstContent());
    const unpublished = unpublishedFrom(first.content);

    // Act
    const publishing = () =>
      service.publish(unpublished, first, TOOLS, publisher, null);

    // Assert
    expect(publishing).toThrow(AgentsUnchangedException);
  });

  it('refuses Agents using a tool the code no longer has', () => {
    // Arrange
    const first = AgentsVersion.first(firstContent());
    const unpublished = unpublishedFrom(first.content);
    unpublished.addSpecialist(
      agentSpec(first.content.modelProfiles[0]!.id),
      TOOLS,
    );
    const fewerTools = [TOOLS[1]!];

    // Act
    const publishing = () =>
      service.publish(unpublished, first, fewerTools, publisher, null);

    // Assert
    expect(publishing).toThrow(AgentsNotPublishableException);
    expect(publishing).toThrow(/list_knowledge/);
  });

  describe('republish', () => {
    it('publishes an earlier Agents Version again as the next one', () => {
      // Arrange
      const first = AgentsVersion.first(firstContent());
      const unpublished = unpublishedFrom(first.content);
      unpublished.addModelProfile(profileSpec('Fast'));
      const second = service.publish(
        unpublished,
        first,
        TOOLS,
        publisher,
        null,
      );

      // Act
      const third = service.republish(
        unpublished,
        second,
        first,
        TOOLS,
        publisher,
        null,
      );

      // Assert
      expect(third.number.value).toBe(3);
      expect(third.content.isSameAs(first.content)).toBe(true);
      expect(unpublished.content.isSameAs(first.content)).toBe(true);
    });

    it('refuses while the Unpublished Agents hold changes', () => {
      // Arrange
      const first = AgentsVersion.first(firstContent());
      const unpublished = unpublishedFrom(first.content);
      unpublished.addModelProfile(profileSpec('Fast'));
      const second = service.publish(
        unpublished,
        first,
        TOOLS,
        publisher,
        null,
      );
      unpublished.addModelProfile(profileSpec('Smart'));

      // Act
      const republishing = () =>
        service.republish(unpublished, second, first, TOOLS, publisher, null);

      // Assert
      expect(republishing).toThrow(UnpublishedAgentsChangedException);
      expect(unpublished.content.modelProfiles).toHaveLength(3);
    });
  });
});
