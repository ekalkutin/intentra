import { describe, expect, it } from 'vitest';

import { UnknownRoleException } from '../exceptions/index.js';

import { Role } from './role.vo.js';

describe('Role', () => {
  it('reads a known value back into the same instance', () => {
    expect(Role.from(Role.Contributor.value)).toBe(Role.Contributor);
  });

  it('rejects an unknown value', () => {
    expect(() => Role.from('owner')).toThrow(UnknownRoleException);
  });
});
