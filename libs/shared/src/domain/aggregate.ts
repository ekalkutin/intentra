import { DomainEvent } from './event.js';
import { EntityId } from './value-objects/index.js';

export abstract class Aggregate<TEntityId extends EntityId> {
  #events: DomainEvent[] = [];

  constructor(public readonly id: TEntityId) {}

  public raise(event: DomainEvent): void {
    this.#events.push(event);
  }

  /** Raised and not yet pulled: a view for tests and checks. */
  public get events(): readonly DomainEvent[] {
    return this.#events;
  }

  /**
   * Pulls the raised events in the order they were raised.
   *
   * One call both returns and clears: the repository that writes the aggregate
   * calls it last and hands the result to the unit of work, so there is no
   * second step to forget. A repeated `pullEvents()` returns nothing, so a
   * second `save` does not announce the same fact twice.
   */
  public pullEvents(): DomainEvent[] {
    const events = this.#events;
    this.#events = [];

    return events;
  }
}
