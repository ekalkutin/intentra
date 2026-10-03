import { baseApi } from '@/shared/api';
import type {
  AuthorizeOAuthClientDto,
  OAuthAuthorizationDto,
  OAuthClientDto,
  OAuthClientQueryDto,
} from '@intentra/contracts/oauth';

/** The consent step of OAuth for MCP clients (`/api/oauth/...`). */
export const oauthApi = baseApi.injectEndpoints({
  endpoints: build => ({
    authorizingClient: build.query<OAuthClientDto, OAuthClientQueryDto>({
      query: params => ({ url: '/oauth/client', params }),
    }),
    authorizeOAuthClient: build.mutation<
      OAuthAuthorizationDto,
      AuthorizeOAuthClientDto
    >({
      query: body => ({ url: '/oauth/authorizations', method: 'POST', body }),
    }),
  }),
});

export const { useAuthorizingClientQuery, useAuthorizeOAuthClientMutation } =
  oauthApi;
