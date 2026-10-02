export type McpOptions = {
  /** Hostnames the MCP endpoint answers to (DNS rebinding protection); localhost only when unset. */
  readonly allowedHosts?: readonly string[];
};

export const MCP_OPTIONS = Symbol('MCP_OPTIONS');
