import { describe, expect, it } from 'vitest';

import { DisplayName } from './display-name.vo.js';
import { Email } from './email.vo.js';
import { PersonalAccessTokenName } from './personal-access-token-name.vo.js';

describe('DisplayName', () => {
  it('is stored trimmed', () => {
    expect(new DisplayName('  Ann Lee ').value).toBe('Ann Lee');
  });

  it('rejects an empty or too long name', () => {
    expect(() => new DisplayName('  ')).toThrow();
    expect(() => new DisplayName('x'.repeat(81))).toThrow();
  });
});

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
