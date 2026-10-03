import type {
  OAuthMetadata,
  OAuthProtectedResourceMetadata,
} from '@modelcontextprotocol/server';
import { Controller, Get, Inject, NotFoundException } from '@nestjs/common';

import {
  OAUTH_OPTIONS,
  oauthUrls,
  type OAuthOptions,
  type OAuthUrls,
} from './oauth-options.js';

/**
 * The discovery documents an MCP client reads after a 401 to find out how to
 * get a token (RFC 9728, RFC 8414). They sit at the root, outside `/api`.
 */
@Controller('.well-known')
export class OAuthDiscoveryController {
  readonly #urls: OAuthUrls | null;

  constructor(@Inject(OAUTH_OPTIONS) options: OAuthOptions) {
    this.#urls = oauthUrls(options);
  }

  // The bare path too: some clients do not insert the resource's path.
  @Get(['oauth-protected-resource', 'oauth-protected-resource/api/mcp'])
  public protectedResource(): OAuthProtectedResourceMetadata {
    const urls = this.#enabled();

    return {
      resource: urls.resource,
      authorization_servers: [urls.issuer],
      bearer_methods_supported: ['header'],
      resource_name: 'Intentra',
    };
  }

  @Get('oauth-authorization-server')
  public authorizationServer(): OAuthMetadata {
    const urls = this.#enabled();

    return {
      issuer: urls.issuer,
      authorization_endpoint: urls.authorization,
      token_endpoint: urls.token,
      registration_endpoint: urls.registration,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['none'],
      authorization_response_iss_parameter_supported: true,
    };
  }

  #enabled(): OAuthUrls {
    if (!this.#urls) {
      throw new NotFoundException('OAuth is off');
    }

    return this.#urls;
  }
}
