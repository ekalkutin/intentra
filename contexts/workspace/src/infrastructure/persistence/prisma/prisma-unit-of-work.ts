import { AsyncLocalStorage } from 'node:async_hooks';

import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { DomainEvent, UnitOfWork } from '@intentra/shared';

import { PrismaService, type PrismaTransaction } from './prisma.service.js';

type OpenWork = {
  readonly transaction: PrismaTransaction;
  readonly events: DomainEvent[];
};

/**
 * Открытая единица работы живёт в асинхронном контексте.
 *
 * Так дескриптор транзакции не надо передавать аргументом через каждый метод
 * репозитория — а значит, его нельзя забыть передать и незаметно записать мимо
 * транзакции. Взамен репозиторий обязан брать клиента через `client`, а не
 * держать ссылку на `PrismaService`.
 */
@Injectable()
export class PrismaUnitOfWork extends UnitOfWork {
  readonly #storage = new AsyncLocalStorage<OpenWork>();

  constructor(
    private readonly database: PrismaService,
    private readonly eventBus: EventBus,
  ) {
    super();
  }

  /** Клиент, которым работать здесь и сейчас: открытая транзакция, если она есть, иначе клиент сам по себе. */
  public get client(): PrismaTransaction {
    return this.#storage.getStore()?.transaction ?? this.database;
  }

  /**
   * Объявляет поднятые агрегатом факты.
   *
   * Внутри открытой работы они копятся до фиксации: подписчик, увидевший факт,
   * которого в итоге не случилось, хуже подписчика, увидевшего его чуть позже.
   * Вне работы откатывать уже нечего, поэтому объявление идёт сразу.
   */
  public async announce(events: readonly DomainEvent[]): Promise<void> {
    const open = this.#storage.getStore();

    if (open) {
      open.events.push(...events);

      return;
    }

    await this.publish(events);
  }

  public async run<T>(work: () => Promise<T>): Promise<T> {
    const collected: DomainEvent[] = [];

    const result = await this.database.$transaction(transaction =>
      this.#storage.run({ transaction, events: collected }, work),
    );

    await this.publish(collected);

    return result;
  }

  private async publish(events: readonly DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.eventBus.publish(event);
    }
  }
}
