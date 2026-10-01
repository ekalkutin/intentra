import { AgentsVersion, UnpublishedAgents } from '../entities/index.js';
import {
  AgentsNotPublishableException,
  AgentsUnchangedException,
  UnpublishedAgentsChangedException,
} from '../exceptions/index.js';
import {
  AgentsVersionNumber,
  type Publisher,
  type PublishingNote,
  type ToolName,
} from '../value-objects/index.js';

/** Turns the Unpublished Agents into the next Agents Version. */
export class AgentsPublishingService {
  /**
   * Checks the whole, then publishes it as the next Agents Version, or as
   * Agents Version 1 when nothing was published yet.
   */
  public publish(
    unpublished: UnpublishedAgents,
    published: AgentsVersion | null,
    availableTools: readonly ToolName[],
    publisher: Publisher,
    note: PublishingNote | null,
  ): AgentsVersion {
    if (published && unpublished.content.isSameAs(published.content)) {
      throw new AgentsUnchangedException();
    }
    const problems = unpublished.content.problems(availableTools);
    if (problems.length > 0) {
      throw new AgentsNotPublishableException(problems);
    }

    return AgentsVersion.publish({
      number: (published?.number.next() ?? AgentsVersionNumber.One).value,
      content: unpublished.content,
      note: note?.value ?? null,
      publisherAccountId: publisher.accountId.value,
      publisherEmail: publisher.email.value,
    });
  }

  /** Publishes an earlier Agents Version again as the next one; refused while unpublished changes would be lost. */
  public republish(
    unpublished: UnpublishedAgents,
    published: AgentsVersion,
    earlier: AgentsVersion,
    availableTools: readonly ToolName[],
    publisher: Publisher,
    note: PublishingNote | null,
  ): AgentsVersion {
    if (!unpublished.content.isSameAs(published.content)) {
      throw new UnpublishedAgentsChangedException();
    }
    unpublished.resetTo(earlier.content);

    return this.publish(
      unpublished,
      published,
      availableTools,
      publisher,
      note,
    );
  }
}
