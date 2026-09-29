import { describe, expect, it } from 'vitest';

import { UnknownInvitationStatusException } from '../exceptions/index.js';

import { InvitationStatus } from './invitation-status.vo.js';

describe('InvitationStatus', () => {
  it.each([
    InvitationStatus.Pending,
    InvitationStatus.Accepted,
    InvitationStatus.Declined,
    InvitationStatus.Revoked,
    InvitationStatus.Expired,
  ])('reads $value back into the same instance', status => {
    // Act
    const read = InvitationStatus.from(status.value);

    // Assert
    expect(read).toBe(status);
  });

  it('rejects an unknown value', () => {
    // Act
    const reading = () => InvitationStatus.from('lost');

    // Assert
    expect(reading).toThrow(UnknownInvitationStatusException);
  });
});
