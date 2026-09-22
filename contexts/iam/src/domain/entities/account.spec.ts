import { describe, expect, it } from 'vitest';

import { AccountRegisteredEvent } from '../events/index.js';

import { Account } from './account.js';

describe('Account', () => {
  const props = { email: 'User@Mail.com', passwordHash: 'salt:key' };

  it('объявляет о регистрации канонизированным адресом', () => {
    const account = Account.register(props);

    expect(account.events).toHaveLength(1);
    expect(account.events[0]).toBeInstanceOf(AccountRegisteredEvent);
    expect(account.events[0]).toMatchObject({
      accountId: account.id.toString(),
      email: 'user@mail.com',
    });
  });

  it('не объявляет ничего при восстановлении из базы', () => {
    const account = Account.reconstitute({ ...props, id: crypto.randomUUID() });

    expect(account.events).toHaveLength(0);
  });

  it('отдаёт поднятые события один раз', () => {
    const account = Account.register(props);

    expect(account.pullEvents()).toHaveLength(1);
    expect(account.pullEvents()).toHaveLength(0);
  });

  it('подменяет хеш при смене пароля', () => {
    const account = Account.register(props);

    account.changePassword('other:hash');

    expect(account.passwordHash).toBe('other:hash');
  });
});
