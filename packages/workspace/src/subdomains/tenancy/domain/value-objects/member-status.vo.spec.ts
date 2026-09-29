import { describe, expect, it } from 'vitest';

import { UnknownMemberStatusException } from '../exceptions/index.js';

import { MemberStatus } from './member-status.vo.js';

describe('MemberStatus', () => {
  it.each([MemberStatus.Active, MemberStatus.Removed])(
    'reads $value back into the same instance',
    status => {
      // Act
      const read = MemberStatus.from(status.value);

      // Assert
      expect(read).toBe(status);
    },
  );

  it('rejects an unknown value', () => {
    // Act
    const reading = () => MemberStatus.from('banned');

    // Assert
    expect(reading).toThrow(UnknownMemberStatusException);
  });
});
