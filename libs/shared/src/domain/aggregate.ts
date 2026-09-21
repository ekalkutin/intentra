import { DomainEvent } from './event.js';
import { EntityId } from './value-objects/index.js';

export abstract class Aggregate<TEntityId extends EntityId> {
  #events: DomainEvent[] = [];

  constructor(public readonly id: TEntityId) {}

  public apply(event: DomainEvent): void {
    this.#events.push(event);
  }

  /** Что поднято и ещё не забрано — представление для тестов и проверок. */
  public get events(): readonly DomainEvent[] {
    return this.#events;
  }

  /**
   * Забирает поднятые события в порядке их появления.
   *
   * Один вызов и возвращает, и очищает: репозиторий, записывающий агрегат,
   * зовёт его последним и отдаёт результат unit of work — второго шага, который
   * можно забыть, здесь нет. Повторный `pullEvents()` вернёт пусто, поэтому
   * второй `save` не объявит тот же факт дважды.
   */
  public pullEvents(): DomainEvent[] {
    const events = this.#events;
    this.#events = [];

    return events;
  }
}
