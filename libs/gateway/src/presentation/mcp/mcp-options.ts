export type McpOptions = {
  /** Hostnames the MCP endpoint answers to (DNS rebinding protection); localhost only when unset. */
  readonly allowedHosts?: readonly string[];
  /** Named in the 401 challenge so OAuth clients find the authorization server; unset while OAuth is off. */
  readonly resourceMetadataUrl?: string;
};

export const MCP_OPTIONS = Symbol('MCP_OPTIONS');
