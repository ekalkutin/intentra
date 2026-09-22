import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { PasswordHasher } from '../../application/ports/index.js';

/**
 * scrypt из `node:crypto` — без сторонней зависимости.
 *
 * Функция нарочно дорогая по процессору и по памяти: перебор паролей должен
 * стоить атакующему столько, чтобы не окупался. Соль своя у каждого хеша и
 * лежит рядом со значением, поэтому одинаковые пароли дают разные строки.
 *
 * https://nodejs.org/api/crypto.html#cryptoscryptsyncpassword-salt-keylen-options
 */
@Injectable()
export class PasswordHashingService implements PasswordHasher {
  private readonly SALT_LENGTH = 32;
  private readonly KEY_LENGTH = 64;
  /** Стоимость по процессору и памяти (N): около 100–200 мс на сверку. */
  private readonly SCRYPT_COST = 16384;
  private readonly SCRYPT_BLOCK_SIZE = 8;
  private readonly SCRYPT_PARALLELIZATION = 1;

  public hash(password: string): string {
    const salt = randomBytes(this.SALT_LENGTH);
    const derivedKey = this.derive(password, salt);

    return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
  }

  public compare(password: string, storedHash: string): boolean {
    try {
      const [saltHex, hashHex] = storedHash.split(':');

      if (!saltHex || !hashHex) {
        return false;
      }

      const expected = Buffer.from(hashHex, 'hex');
      const actual = this.derive(password, Buffer.from(saltHex, 'hex'));

      // Сравнение за постоянное время: обычное `===` выдавало бы длину общего
      // префикса временем ответа.
      return (
        expected.length === actual.length && timingSafeEqual(expected, actual)
      );
    } catch {
      return false;
    }
  }

  private derive(password: string, salt: Buffer): Buffer {
    return scryptSync(password, salt, this.KEY_LENGTH, {
      N: this.SCRYPT_COST,
      r: this.SCRYPT_BLOCK_SIZE,
      p: this.SCRYPT_PARALLELIZATION,
    });
  }
}
