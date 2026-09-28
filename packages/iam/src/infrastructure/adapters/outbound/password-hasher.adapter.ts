import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

import { Injectable, Provider } from '@nestjs/common';

import { PasswordHasher } from '../../../application/ports/outbound/index.js';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keyLength: number,
) => Promise<Buffer>;

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

@Injectable()
export class PasswordHasherAdapter extends PasswordHasher {
  public async hash(password: string): Promise<string> {
    const salt = randomBytes(SALT_LENGTH);
    const key = await scryptAsync(password, salt, KEY_LENGTH);
    return `${salt.toString('hex')}:${key.toString('hex')}`;
  }

  public async compare(password: string, storedHash: string): Promise<boolean> {
    const [saltHex, keyHex] = storedHash.split(':');
    if (!saltHex || !keyHex) {
      return false;
    }

    const storedKey = Buffer.from(keyHex, 'hex');
    if (storedKey.length !== KEY_LENGTH) {
      return false;
    }

    const key = await scryptAsync(
      password,
      Buffer.from(saltHex, 'hex'),
      KEY_LENGTH,
    );
    return timingSafeEqual(storedKey, key);
  }
}

export const PASSWORD_HASHER_PROVIDER: Provider = {
  provide: PasswordHasher,
  useClass: PasswordHasherAdapter,
};
