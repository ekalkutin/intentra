const MCP_PATH = '/api/mcp';

/**
 * Where external agents reach a Workspace over MCP, on this site's own
 * origin. The address names the Workspace, so only its tokens work there.
 */
export function mcpUrl(workspaceSlug: string): string {
  return `${window.location.origin}${MCP_PATH}/${workspaceSlug}`;
}

/**
 * What a Workspace's connection is called in an agent and where the agent
 * keeps its token: one of each per Workspace, so that connections to several
 * Workspaces live side by side.
 */
export function mcpConnection(workspaceSlug: string): {
  readonly name: string;
  readonly tokenVariable: string;
} {
  return {
    name: `intentra-${workspaceSlug}`,
    tokenVariable: `INTENTRA_TOKEN_${workspaceSlug.toUpperCase().replaceAll('-', '_')}`,
  };
}

/** Characters of a secret left readable in a preview, so it can be recognised but not read off a screen. */
const VISIBLE_SECRET = 8;

/** A secret shortened for showing: `intr_ssW…85`. The full one is only ever copied. */
export function maskSecret(secret: string): string {
  return secret.length <= VISIBLE_SECRET + 2
    ? secret
    : `${secret.slice(0, VISIBLE_SECRET)}…${secret.slice(-2)}`;
}
