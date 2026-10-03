import { describe, expect, it } from 'vitest';

import { mcpConnectionName, mcpSetup, type McpConnection } from './mcp';

const CONNECTION: McpConnection = {
  name: 'intentra-acme',
  url: 'https://intentra.example.com/api/mcp/acme',
  secret: 'intr_secret',
};

describe('mcpConnectionName', () => {
  it('names the connection after the Workspace', () => {
    // Act
    const name = mcpConnectionName('acme-labs');

    // Assert
    expect(name).toBe('intentra-acme-labs');
  });
});

describe('mcpSetup', () => {
  it('gives Claude Code one command with the whole token in it', () => {
    // Act
    const setup = mcpSetup('claude-code', CONNECTION);

    // Assert
    expect(setup).toEqual({
      kind: 'command',
      text: 'claude mcp add --transport http intentra-acme https://intentra.example.com/api/mcp/acme --header "Authorization: Bearer intr_secret"',
    });
  });

  it("appends the server to Codex's config file", () => {
    // Act
    const setup = mcpSetup('codex', CONNECTION);

    // Assert
    expect(setup.kind).toBe('command');
    expect(setup.text).toContain('[mcp_servers.intentra-acme]');
    expect(setup.text).toContain(
      'http_headers = { Authorization = "Bearer intr_secret" }',
    );
  });

  it('gives Cursor a piece of its config file', () => {
    // Act
    const setup = mcpSetup('cursor', CONNECTION);

    // Assert
    expect(setup.kind).toBe('config');
    expect(JSON.parse(setup.text)).toEqual({
      mcpServers: {
        'intentra-acme': {
          url: CONNECTION.url,
          headers: { Authorization: 'Bearer intr_secret' },
        },
      },
    });
  });

  it('gives any other client the address and the header', () => {
    // Act
    const setup = mcpSetup('other', CONNECTION);

    // Assert
    expect(setup).toEqual({
      kind: 'details',
      text: 'https://intentra.example.com/api/mcp/acme\nAuthorization: Bearer intr_secret',
    });
  });
});
