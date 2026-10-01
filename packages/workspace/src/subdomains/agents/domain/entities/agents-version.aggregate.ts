import { AccountId, Aggregate, Email } from '@intentra/shared-kernel';

import {
  AgentsVersionId,
  AgentsVersionNumber,
  Publisher,
  PublishingNote,
} from '../value-objects/index.js';

import { AgentsContent } from './agents-content.js';

/** One numbered, unchangeable version of all of Intentra's Agents together. */
export class AgentsVersion extends Aggregate<AgentsVersionId> {
  readonly #number: AgentsVersionNumber;
  readonly #content: AgentsContent;
  readonly #note: PublishingNote | null;
  readonly #publisher: Publisher;
  readonly #publishedAt: Temporal.Instant;

  private constructor(id: AgentsVersionId, state: AgentsVersionState) {
    super(id);
    this.#number = state.number;
    this.#content = state.content;
    this.#note = state.note;
    this.#publisher = state.publisher;
    this.#publishedAt = state.publishedAt;
  }

  get number(): AgentsVersionNumber {
    return this.#number;
  }

  get content(): AgentsContent {
    return this.#content;
  }

  get note(): PublishingNote | null {
    return this.#note;
  }

  get publisher(): Publisher {
    return this.#publisher;
  }

  get publishedAt(): Temporal.Instant {
    return this.#publishedAt;
  }

  public static publish(props: AgentsVersionPublishProps): AgentsVersion {
    return new AgentsVersion(new AgentsVersionId(), {
      number: new AgentsVersionNumber(props.number),
      content: props.content,
      note: props.note === null ? null : new PublishingNote(props.note),
      publisher: new Publisher(
        new AccountId(props.publisherAccountId),
        new Email(props.publisherEmail),
      ),
      publishedAt: Temporal.Now.instant(),
    });
  }

  public static restore(props: AgentsVersionRestoreProps): AgentsVersion {
    return new AgentsVersion(new AgentsVersionId(props.id), {
      number: new AgentsVersionNumber(props.number),
      content: props.content,
      note: props.note === null ? null : new PublishingNote(props.note),
      publisher: new Publisher(
        new AccountId(props.publisherAccountId),
        new Email(props.publisherEmail),
      ),
      publishedAt: props.publishedAt,
    });
  }
}

type AgentsVersionState = {
  readonly number: AgentsVersionNumber;
  readonly content: AgentsContent;
  readonly note: PublishingNote | null;
  readonly publisher: Publisher;
  readonly publishedAt: Temporal.Instant;
};
type AgentsVersionPublishProps = {
  readonly number: number;
  readonly content: AgentsContent;
  readonly note: string | null;
  readonly publisherAccountId: string;
  readonly publisherEmail: string;
};
type AgentsVersionRestoreProps = AgentsVersionPublishProps & {
  readonly id: string;
  readonly publishedAt: Temporal.Instant;
};
