const BEARER = /^Bearer\s+(\S+)$/i;

/** The token from an `Authorization: Bearer …` header, if there is one. */
export function readBearerToken(
  headers: Readonly<Record<string, string | string[] | undefined>>,
): string | undefined {
  const header = headers.authorization;

  return typeof header === 'string' ? BEARER.exec(header)?.[1] : undefined;
}
