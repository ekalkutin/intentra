import { getOAuthProtectedResourceMetadataUrl } from '@modelcontextprotocol/server';

export type OAuthOptions = {
  /** Where people open Intentra, such as `https://intentra.example.com`; OAuth for MCP clients is off when unset. */
  readonly publicUrl?: string;
};

export const OAUTH_OPTIONS = Symbol('OAUTH_OPTIONS');

/** The addresses OAuth clients learn from the discovery documents. */
export type OAuthUrls = {
  /** The authorization server: Intentra itself. */
  readonly issuer: string;
  /** The MCP endpoint the tokens are for. */
  readonly resource: string;
  readonly resourceMetadata: string;
  /** The consent page in the web UI. */
  readonly authorization: string;
  readonly token: string;
  readonly registration: string;
};

export const MCP_PATH = '/api/mcp';
export const AUTHORIZATION_PAGE_PATH = '/oauth/authorize';
export const TOKEN_PATH = '/api/oauth/token';
export const REGISTRATION_PATH = '/api/oauth/register';

/** Null while OAuth is off. */
export function oauthUrls(options: OAuthOptions): OAuthUrls | null {
  if (!options.publicUrl) {
    return null;
  }
  const issuer = new URL(options.publicUrl).origin;
  const resource = new URL(MCP_PATH, issuer);

  return {
    issuer,
    resource: resource.href,
    resourceMetadata: getOAuthProtectedResourceMetadataUrl(resource),
    authorization: new URL(AUTHORIZATION_PAGE_PATH, issuer).href,
    token: new URL(TOKEN_PATH, issuer).href,
    registration: new URL(REGISTRATION_PATH, issuer).href,
  };
}
