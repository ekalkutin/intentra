import { describe, expect, it } from 'vitest';

import { afterResponse } from './reauth';

const old = { accessToken: 'access-1', refreshToken: 'refresh-1' };
const renewed = { accessToken: 'access-2', refreshToken: 'refresh-2' };

describe('afterResponse', () => {
  it('refreshes when the access token it was sent with expired', () => {
    // Act
    const next = afterResponse({ status: 401, sentWith: old, current: old });

    // Assert
    expect(next).toBe('refresh');
  });

  it('retries when the session was refreshed meanwhile', () => {
    // Act
    const next = afterResponse({
      status: 401,
      sentWith: old,
      current: renewed,
    });

    // Assert
    expect(next).toBe('retry');
  });

  it.each([
    ['an answer that is not 401', { status: 200, sentWith: old, current: old }],
    ['another failure', { status: 409, sentWith: old, current: old }],
    [
      'a request sent signed out',
      { status: 401, sentWith: null, current: null },
    ],
    [
      'a sign-in refused while another tab is signed in',
      { status: 401, sentWith: null, current: old },
    ],
    ['a session already gone', { status: 401, sentWith: old, current: null }],
    [
      'a network failure',
      { status: 'FETCH_ERROR', sentWith: old, current: old },
    ],
  ])('leaves %s as it is', (_case, props) => {
    // Act
    const next = afterResponse(props);

    // Assert
    expect(next).toBe('done');
  });
});
