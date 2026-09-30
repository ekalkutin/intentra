import { describe, expect, it } from 'vitest';

import { safeReturnTo, signInPath } from './return-to';

describe('safeReturnTo', () => {
  it.each([
    ['/w/acme/p/billing', '/w/acme/p/billing'],
    ['/w/acme?tab=members#top', '/w/acme?tab=members#top'],
    ['/', '/'],
  ])('keeps a path of the app: %s', (value, expected) => {
    // Act
    const path = safeReturnTo(value);

    // Assert
    expect(path).toBe(expected);
  });

  it.each([
    null,
    undefined,
    '',
    'w/acme',
    '//evil.com',
    '//evil.com/w/acme',
    '/\\evil.com',
    'https://evil.com',
    'javascript:alert(1)',
  ])('goes home rather than to %s', value => {
    // Act
    const path = safeReturnTo(value);

    // Assert
    expect(path).toBe('/');
  });
});

describe('signInPath', () => {
  it('remembers where the person was going', () => {
    // Act
    const path = signInPath('/w/acme?tab=members');

    // Assert
    expect(path).toBe('/auth/sign-in?returnTo=%2Fw%2Facme%3Ftab%3Dmembers');
  });

  it('needs no reminder for home', () => {
    // Act
    const path = signInPath('/');

    // Assert
    expect(path).toBe('/auth/sign-in');
  });
});
