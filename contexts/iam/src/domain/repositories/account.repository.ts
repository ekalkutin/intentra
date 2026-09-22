import { Account } from '../entities/index.js';

/**
 * `get` бросает, когда записи нет, `find` возвращает `null`: вызывающему не
 * нужно помнить, какой из двух ответов здесь считается нормальным.
 */
export abstract class AccountRepository {
  abstract save(account: Account): Promise<void>;
  abstract getById(id: string): Promise<Account>;
  abstract findByEmail(email: string): Promise<Account | null>;
}
