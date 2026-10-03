/** An OAuth authorization request (RFC 6749 §4.1.1 with PKCE), as the client put it in the address. */
export type AuthorizationRequest = {
  readonly clientId: string;
  readonly redirectUri: string;
  readonly responseType: string | null;
  readonly codeChallenge: string | null;
  readonly codeChallengeMethod: string | null;
  readonly state: string | null;
  /** RFC 8707: the MCP address the client asks a token for. */
  readonly resource: string | null;
};

/** Null without a client or a redirect URI: then there is nowhere to send even an error. */
export function readAuthorizationRequest(
  params: URLSearchParams,
): AuthorizationRequest | null {
  const clientId = params.get('client_id');
  const redirectUri = params.get('redirect_uri');
  if (!clientId || !redirectUri) {
    return null;
  }

  return {
    clientId,
    redirectUri,
    responseType: params.get('response_type'),
    codeChallenge: params.get('code_challenge'),
    codeChallengeMethod: params.get('code_challenge_method'),
    state: params.get('state'),
    resource: params.get('resource'),
  };
}

/** A Workspace's own MCP address ends with its slug: `/api/mcp/<slug>`. */
const WORKSPACE_RESOURCE_PATH = /^\/api\/mcp\/([^/]+)\/?$/;

/**
 * The slug of the Workspace the client connects to, when it asks for a token
 * for a Workspace's own MCP address; null for the common address, where the
 * person picks the Workspace.
 */
export function requestedWorkspaceSlug(
  request: AuthorizationRequest,
): string | null {
  if (!request.resource || !URL.canParse(request.resource)) {
    return null;
  }
  const slug = WORKSPACE_RESOURCE_PATH.exec(
    new URL(request.resource).pathname,
  )?.[1];

  return slug === undefined ? null : decodeURIComponent(slug);
}

/** What is wrong with a request from a known client, as an OAuth error code, or null. */
export function requestProblem(request: AuthorizationRequest): string | null {
  if (request.responseType !== 'code') {
    return 'unsupported_response_type';
  }
  if (!request.codeChallenge || request.codeChallengeMethod !== 'S256') {
    return 'invalid_request';
  }

  return null;
}

/** Back to the client with an error; only for a redirect URI the server has checked. */
export function errorRedirectUrl(
  request: AuthorizationRequest,
  error: string,
): string {
  const url = new URL(request.redirectUri);
  url.searchParams.set('error', error);
  if (request.state !== null) {
    url.searchParams.set('state', request.state);
  }

  return url.href;
}
