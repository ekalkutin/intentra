import { describe, expect, it } from 'vitest';

import { Email } from './email.vo.js';

describe('Email', () => {
  it('приводит адрес к нижнему регистру и снимает пробелы', () => {
    expect(new Email('  User@Mail.COM ').value).toBe('user@mail.com');
  });

  it('считает равными адреса, различающиеся только регистром', () => {
    expect(new Email('User@Mail.com').equals(new Email('user@mail.com'))).toBe(
      true,
    );
  });

  it.each(['', 'user', 'user@', '@mail.com', 'user@mail', 'a b@mail.com'])(
    'отвергает «%s»',
    value => {
      expect(() => new Email(value)).toThrow();
    },
  );
});
