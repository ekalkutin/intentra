import { Reflector } from '@nestjs/core';

export enum AuthMethod {
  /** A JWT access token: people in the UI. The default. */
  AccessToken,
  /** A personal access token: MCP agents. */
  PersonalAccessToken,
  /** No token at all: signing up and in. */
  None,
}

/** How a route authenticates; without it, by an access token. */
export const Authentication = Reflector.createDecorator<AuthMethod>();

export const Public = () => Authentication(AuthMethod.None);
