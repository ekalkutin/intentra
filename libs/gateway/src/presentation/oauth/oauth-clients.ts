import { z } from 'zod';

/** A client registered through Dynamic Client Registration (RFC 7591). */
export type OAuthClient = {
  readonly name: string;
  readonly redirectUris: readonly string[];
};

export const MAX_REDIRECT_URIS = 10;
const MAX_NAME_LENGTH = 100;
const FALLBACK_NAME = 'OAuth client';
const FORBIDDEN_SCHEMES = new Set([
  'javascript:',
  'data:',
  'file:',
  'vbscript:',
]);
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

const StoredClientSchema = z.object({
  n: z.string(),
  r: z.array(z.string()).min(1).max(MAX_REDIRECT_URIS),
});

/**
 * Registration is open to anyone, so a signature would prove nothing: the
 * client id simply carries the client's name and redirect URIs, and nothing
 * is stored. What protects the person is the consent page, which shows both.
 */
export function encodeClientId(client: OAuthClient): string {
  const stored: z.infer<typeof StoredClientSchema> = {
    n: client.name,
    r: [...client.redirectUris],
  };

  return Buffer.from(JSON.stringify(stored)).toString('base64url');
}

/** Undefined for anything that is not a client id this server gave out. */
export function decodeClientId(clientId: string): OAuthClient | undefined {
  try {
    const parsed = StoredClientSchema.safeParse(
      JSON.parse(Buffer.from(clientId, 'base64url').toString('utf8')),
    );
    if (!parsed.success || !parsed.data.r.every(isAllowedRedirectUri)) {
      return undefined;
    }

    return { name: parsed.data.n, redirectUris: parsed.data.r };
  } catch {
    return undefined;
  }
}

/** HTTPS, plain HTTP only to this machine (CLI agents), or an app's own scheme. */
export function isAllowedRedirectUri(uri: string): boolean {
  if (!URL.canParse(uri)) {
    return false;
  }
  const url = new URL(uri);
  if (url.hash || FORBIDDEN_SCHEMES.has(url.protocol)) {
    return false;
  }
  if (url.protocol === 'http:') {
    return LOOPBACK_HOSTS.has(url.hostname);
  }

  return true;
}

export function clientName(name: string | undefined): string {
  const trimmed = name?.trim().slice(0, MAX_NAME_LENGTH) ?? '';

  return trimmed.length > 0 ? trimmed : FALLBACK_NAME;
}
