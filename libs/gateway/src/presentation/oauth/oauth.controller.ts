import type { ServerResponse } from 'node:http';

import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  NotFoundException,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';

import type { Actor } from '@intentra/contracts/iam';
import {
  AuthorizeOAuthClientDtoSchema,
  OAuthClientQueryDtoSchema,
  type AuthorizeOAuthClientDto,
  type OAuthAuthorizationDto,
  type OAuthClientDto,
  type OAuthClientQueryDto,
} from '@intentra/contracts/oauth';
import { WorkspaceApi } from '@intentra/contracts/workspace';

import { ActorGuard, CurrentActor } from '../rest/auth/index.js';
import { InvalidOAuthRequestException } from '../rest/errors/index.js';

import { AuthorizationCodes } from './authorization-codes.js';
import {
  clientName,
  decodeClientId,
  encodeClientId,
  isAllowedRedirectUri,
  MAX_REDIRECT_URIS,
  type OAuthClient,
} from './oauth-clients.js';
import {
  OAUTH_OPTIONS,
  oauthUrls,
  type OAuthOptions,
  type OAuthUrls,
} from './oauth-options.js';

const RegistrationRequestSchema = z.looseObject({
  redirect_uris: z.array(z.string()).min(1).max(MAX_REDIRECT_URIS),
  client_name: z.string().optional(),
});

const TokenRequestSchema = z.object({
  grant_type: z.literal('authorization_code'),
  code: z.string().min(1),
  redirect_uri: z.string().min(1),
  client_id: z.string().min(1),
  code_verifier: z.string().min(43).max(128),
});

/**
 * Intentra as an OAuth authorization server for MCP clients that cannot take
 * a Personal Access Token by hand (ChatGPT). A person approves the client on
 * the consent page, which creates a Personal Access Token of theirs; the
 * client receives it as its access token. Registration and the token
 * endpoint answer in OAuth's own error format, not the REST one.
 */
@Controller('oauth')
export class OAuthController {
  readonly #urls: OAuthUrls | null;

  constructor(
    @Inject(WorkspaceApi) private readonly workspace: WorkspaceApi,
    private readonly codes: AuthorizationCodes,
    @Inject(OAUTH_OPTIONS) options: OAuthOptions,
  ) {
    this.#urls = oauthUrls(options);
  }

  /** Dynamic Client Registration (RFC 7591), open to anyone; public clients only. */
  @Post('register')
  public register(@Body() body: unknown, @Res() res: ServerResponse): void {
    this.#enabled();
    const parsed = RegistrationRequestSchema.safeParse(body);
    if (!parsed.success) {
      return oauthError(res, 'invalid_client_metadata', parsed.error.message);
    }
    const redirectUris = parsed.data.redirect_uris;
    if (!redirectUris.every(isAllowedRedirectUri)) {
      return oauthError(
        res,
        'invalid_redirect_uri',
        'Redirect URIs must be HTTPS, HTTP to localhost, or an app scheme',
      );
    }
    const client: OAuthClient = {
      name: clientName(parsed.data.client_name),
      redirectUris,
    };

    sendJson(res, HttpStatus.CREATED, {
      client_id: encodeClientId(client),
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_name: client.name,
      redirect_uris: client.redirectUris,
      grant_types: ['authorization_code'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    });
  }

  /** For the consent page: who is asking, checked before anything is shown. */
  @Get('client')
  public client(
    @Query({ schema: OAuthClientQueryDtoSchema }) query: OAuthClientQueryDto,
  ): OAuthClientDto {
    this.#enabled();
    const client = findClient(query);

    return {
      name: client.name,
      redirectHost: new URL(query.redirectUri).host,
    };
  }

  /** The person approves: a Personal Access Token is created and a code for it goes back to the client. */
  @Post('authorizations')
  @UseGuards(ActorGuard)
  public async authorize(
    @CurrentActor() actor: Actor,
    @Body({ schema: AuthorizeOAuthClientDtoSchema })
    data: AuthorizeOAuthClientDto,
  ): Promise<OAuthAuthorizationDto> {
    const urls = this.#enabled();
    const client = findClient(data);
    const created = await this.workspace.personalAccessTokens.create(
      actor,
      data.workspaceId,
      {
        name: client.name,
        level: data.level,
        lifetimeDays: data.lifetimeDays,
      },
    );
    const code = this.codes.issue({
      clientId: data.clientId,
      redirectUri: data.redirectUri,
      codeChallenge: data.codeChallenge,
      secret: created.secret,
      tokenExpiresAt: created.token.expiresAt,
    });
    const redirectUrl = new URL(data.redirectUri);
    redirectUrl.searchParams.set('code', code);
    if (data.state !== undefined) {
      redirectUrl.searchParams.set('state', data.state);
    }
    redirectUrl.searchParams.set('iss', urls.issuer);

    return { redirectUrl: redirectUrl.href };
  }

  /** Exchanges a code for the Personal Access Token; there is no refresh token. */
  @Post('token')
  public token(@Body() body: unknown, @Res() res: ServerResponse): void {
    this.#enabled();
    const parsed = TokenRequestSchema.safeParse(body);
    if (!parsed.success) {
      const grantType = (body as { grant_type?: unknown } | undefined)
        ?.grant_type;

      return grantType !== undefined && grantType !== 'authorization_code'
        ? oauthError(
            res,
            'unsupported_grant_type',
            'Only authorization_code is supported',
          )
        : oauthError(res, 'invalid_request', parsed.error.message);
    }
    const request = parsed.data;
    const grant = this.codes.redeem(request.code, request.code_verifier);
    if (
      !grant ||
      grant.clientId !== request.client_id ||
      grant.redirectUri !== request.redirect_uri
    ) {
      return oauthError(
        res,
        'invalid_grant',
        'The code is unknown, used, expired, or not for this client',
      );
    }

    sendJson(res, HttpStatus.OK, {
      access_token: grant.secret,
      token_type: 'Bearer',
      ...(grant.tokenExpiresAt && {
        expires_in: Math.max(
          0,
          Math.floor((Date.parse(grant.tokenExpiresAt) - Date.now()) / 1000),
        ),
      }),
    });
  }

  #enabled(): OAuthUrls {
    if (!this.#urls) {
      throw new NotFoundException('OAuth is off');
    }

    return this.#urls;
  }
}

/** The client behind the id, if the redirect URI is one it registered. */
function findClient({
  clientId,
  redirectUri,
}: OAuthClientQueryDto): OAuthClient {
  const client = decodeClientId(clientId);
  if (!client) {
    throw new InvalidOAuthRequestException('Unknown OAuth client');
  }
  if (!client.redirectUris.includes(redirectUri)) {
    throw new InvalidOAuthRequestException(
      'The redirect URI is not registered for this client',
    );
  }

  return client;
}

function oauthError(
  res: ServerResponse,
  error: string,
  description: string,
): void {
  sendJson(res, HttpStatus.BAD_REQUEST, {
    error,
    error_description: description,
  });
}

function sendJson(res: ServerResponse, status: number, body: object): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}
