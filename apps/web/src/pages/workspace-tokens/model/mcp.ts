/** Where external agents reach Intentra over MCP, on this site's own origin. */
const MCP_PATH = '/api/mcp';

export function mcpUrl(): string {
  return `${window.location.origin}${MCP_PATH}`;
}

/** Characters of a secret left readable in a preview, so it can be recognised but not read off a screen. */
const VISIBLE_SECRET = 8;

/** A secret shortened for showing: `intr_ssW…85`. The full one is only ever copied. */
export function maskSecret(secret: string): string {
  return secret.length <= VISIBLE_SECRET + 2
    ? secret
    : `${secret.slice(0, VISIBLE_SECRET)}…${secret.slice(-2)}`;
}
