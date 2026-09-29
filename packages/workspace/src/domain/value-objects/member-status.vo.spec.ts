import { describe, expect, it } from 'vitest';

import { UnknownMemberStatusException } from '../exceptions/index.js';

import { MemberStatus } from './member-status.vo.js';

describe('MemberStatus', () => {
  it.each([MemberStatus.Active, MemberStatus.Removed])(
    'reads $value back into the same instance',
    status => {
      expect(MemberStatus.from(status.value)).toBe(status);
    },
  );

  it('rejects an unknown value', () => {
    expect(() => MemberStatus.from('banned')).toThrow(
      UnknownMemberStatusException,
    );
  });
});
