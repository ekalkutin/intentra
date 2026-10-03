import { z } from 'zod';

import { CreatePersonalAccessTokenDtoSchema } from '../workspace/personal-access-tokens/create-personal-access-token.dto.js';

/** What the consent page asks about before showing an OAuth client to the person. */
export const OAuthClientQueryDtoSchema = z.object({
  clientId: z.string().min(1),
  redirectUri: z.string().min(1),
});

export type OAuthClientQueryDto = z.infer<typeof OAuthClientQueryDtoSchema>;

/** An external agent registered over OAuth, as the consent page shows it. */
export type OAuthClientDto = {
  /** What the client calls itself, such as "ChatGPT". */
  readonly name: string;
  /** Where the person is sent back to, so they see who gets the access. */
  readonly redirectHost: string;
};

/**
 * The person lets an OAuth client in: it gets a Personal Access Token of
 * theirs in the chosen Workspace, with the chosen level and lifetime.
 */
export const AuthorizeOAuthClientDtoSchema = OAuthClientQueryDtoSchema.extend({
  /** PKCE, S256 only. */
  codeChallenge: z.string().min(43).max(128),
  codeChallengeMethod: z.literal('S256'),
  state: z.string().max(2048).optional(),
  workspaceId: z.string().min(1),
  level: CreatePersonalAccessTokenDtoSchema.shape.level,
  lifetimeDays: CreatePersonalAccessTokenDtoSchema.shape.lifetimeDays,
});

export type AuthorizeOAuthClientDto = z.infer<
  typeof AuthorizeOAuthClientDtoSchema
>;

export type OAuthAuthorizationDto = {
  /** The client's redirect URI with the authorization code; the page goes there. */
  readonly redirectUrl: string;
};
