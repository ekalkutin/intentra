import { describe, expect, it } from 'vitest';

import { Email } from './email.vo.js';
import { PersonalAccessTokenName } from './personal-access-token-name.vo.js';

describe('Email', () => {
  it('is stored trimmed and lower-case', () => {
    expect(new Email('  Ann@Example.COM ').value).toBe('ann@example.com');
  });

  it('rejects a value that is not an email', () => {
    expect(() => new Email('ann')).toThrow();
  });
});

describe('PersonalAccessTokenName', () => {
  it('rejects an empty or too long name', () => {
    expect(() => new PersonalAccessTokenName('  ')).toThrow();
    expect(() => new PersonalAccessTokenName('x'.repeat(101))).toThrow();
  });
});
