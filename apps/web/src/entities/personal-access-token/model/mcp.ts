const MCP_PATH = '/api/mcp';

/**
 * Where external agents reach a Workspace over MCP, on this site's own
 * origin. The address names the Workspace, so only its tokens work there.
 */
export function mcpUrl(workspaceSlug: string): string {
  return `${window.location.origin}${MCP_PATH}/${workspaceSlug}`;
}

/**
 * What a Workspace's connection is called in an agent: one per Workspace, so
 * that connections to several Workspaces live side by side.
 */
export function mcpConnectionName(workspaceSlug: string): string {
  return `intentra-${workspaceSlug}`;
}

/** The agents a new token comes with ready instructions for; `other` is any MCP client. */
export const MCP_CLIENTS = ['claude-code', 'codex', 'cursor', 'other'] as const;

export type McpClient = (typeof MCP_CLIENTS)[number];

export type McpConnection = {
  readonly name: string;
  readonly url: string;
  readonly secret: string;
};

/**
 * What sets a client up by hand: a shell command to run, a piece of its
 * config file, or, for a client we know nothing about, the address and the
 * header as they are.
 */
export type McpSetup = {
  readonly kind: 'command' | 'config' | 'details';
  readonly text: string;
};

export function mcpSetup(
  client: McpClient,
  { name, url, secret }: McpConnection,
): McpSetup {
  switch (client) {
    case 'claude-code':
      return {
        kind: 'command',
        text: `claude mcp add --transport http ${name} ${url} --header "Authorization: Bearer ${secret}"`,
      };
    case 'codex':
      // Codex has no flag for a header: the server goes into its config file.
      return {
        kind: 'command',
        text: [
          "cat >> ~/.codex/config.toml <<'EOF'",
          '',
          `[mcp_servers.${name}]`,
          `url = "${url}"`,
          `http_headers = { Authorization = "Bearer ${secret}" }`,
          'EOF',
        ].join('\n'),
      };
    case 'cursor':
      return {
        kind: 'config',
        text: JSON.stringify(
          {
            mcpServers: {
              [name]: { url, headers: { Authorization: `Bearer ${secret}` } },
            },
          },
          null,
          2,
        ),
      };
    case 'other':
      return {
        kind: 'details',
        text: `${url}\nAuthorization: Bearer ${secret}`,
      };
  }
}
