import { describe, expect, it } from 'vitest';

import {
  errorRedirectUrl,
  readAuthorizationRequest,
  requestProblem,
} from './authorization-request';

const REDIRECT_URI = 'https://chatgpt.com/connector_platform_oauth_redirect';

function request(extra: Record<string, string> = {}) {
  const parsed = readAuthorizationRequest(
    new URLSearchParams({
      client_id: 'client',
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      code_challenge: 'challenge',
      code_challenge_method: 'S256',
      ...extra,
    }),
  );
  if (!parsed) {
    throw new Error('Expected a request');
  }

  return parsed;
}

describe('readAuthorizationRequest', () => {
  it('needs a redirect URI', () => {
    // Act
    const parsed = readAuthorizationRequest(
      new URLSearchParams({ client_id: 'client' }),
    );

    // Assert
    expect(parsed).toBeNull();
  });
});

describe('requestProblem', () => {
  it('accepts a code request with an S256 challenge', () => {
    // Act
    const problem = requestProblem(request());

    // Assert
    expect(problem).toBeNull();
  });

  it('refuses a plain PKCE challenge', () => {
    // Act
    const problem = requestProblem(request({ code_challenge_method: 'plain' }));

    // Assert
    expect(problem).toBe('invalid_request');
  });

  it('refuses a response type other than code', () => {
    // Act
    const problem = requestProblem(request({ response_type: 'token' }));

    // Assert
    expect(problem).toBe('unsupported_response_type');
  });
});

describe('errorRedirectUrl', () => {
  it('returns the error and the state to the client', () => {
    // Act
    const url = new URL(
      errorRedirectUrl(request({ state: 'xyz' }), 'access_denied'),
    );

    // Assert
    expect(url.origin + url.pathname).toBe(REDIRECT_URI);
    expect(url.searchParams.get('error')).toBe('access_denied');
    expect(url.searchParams.get('state')).toBe('xyz');
  });
});
