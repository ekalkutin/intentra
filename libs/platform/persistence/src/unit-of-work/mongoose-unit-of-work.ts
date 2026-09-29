import { AsyncLocalStorage } from 'node:async_hooks';

import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { ClientSession, Connection } from 'mongoose';

import { UnitOfWork } from '@intentra/shared-kernel';

import { NoUnitOfWorkException } from '../exceptions/index.js';

/**
 * Keeps the open transaction's session in async context. The cell belongs to
 * the instance, so two applications in one process never share a session.
 *
 * Mongoose retries the whole work on a transient transaction error: the work
 * must do nothing but database writes.
 */
@Injectable()
export class MongooseUnitOfWork extends UnitOfWork {
  readonly #sessions = new AsyncLocalStorage<ClientSession>();

  constructor(@InjectConnection() private readonly connection: Connection) {
    super();
  }

  public override async run<T>(work: () => Promise<T>): Promise<T> {
    if (this.#sessions.getStore()) {
      return work();
    }

    return this.connection.transaction(session =>
      this.#sessions.run(session, work),
    );
  }

  /** The open transaction's session for reads, or null outside a unit of work. */
  public get session(): ClientSession | null {
    return this.#sessions.getStore() ?? null;
  }

  /** The open transaction's session for writes; throws outside a unit of work. */
  public requireSession(): ClientSession {
    const session = this.#sessions.getStore();
    if (!session) {
      throw new NoUnitOfWorkException();
    }

    return session;
  }
}
