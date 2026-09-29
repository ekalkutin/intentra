import { describe, expect, it } from 'vitest';

import { UnknownRoleException } from '../exceptions/index.js';

import { Role } from './role.vo.js';

describe('Role', () => {
  it('reads a known value back into the same instance', () => {
    // Arrange
    const value = Role.Owner.value;

    // Act
    const role = Role.from(value);

    // Assert
    expect(role).toBe(Role.Owner);
  });

  it('rejects an unknown value', () => {
    // Act
    const reading = () => Role.from('contributor');

    // Assert
    expect(reading).toThrow(UnknownRoleException);
  });
});
