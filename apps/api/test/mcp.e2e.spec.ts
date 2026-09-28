import { HttpStatus } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AgentsModule } from '@intentra/agents';
import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceModule } from '@intentra/workspace';

const MCP_PATH = '/api/mcp';

describe('POST /api/mcp', () => {
  let app: TestingApp;

  const call = (method: string, params: object) =>
    app
      .request()
      .post(MCP_PATH)
      .set('Accept', 'application/json, text/event-stream')
      .send({ jsonrpc: '2.0', id: 1, method, params });

  beforeAll(async () => {
    app = await TestingApp.create({
      imports: [
        GatewayModule.register({
          contexts: [
            IamModule.register({
              accessTokenSecret: 'test-access-secret',
              refreshTokenSecret: 'test-refresh-secret',
              accessTokenTtlSeconds: 900,
              refreshTokenTtlSeconds: 604800,
            }),
            WorkspaceModule.register({}),
            AgentsModule.register({}),
          ],
        }),
      ],
    });
  });

  afterAll(() => app?.close());

  it('initializes an MCP session', async () => {
    // Act
    const response = await call('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'e2e', version: '1.0.0' },
    });

    // Assert
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.text).toContain('"name":"intentra"');
  });

  it('calls the echo tool', async () => {
    // Act
    const response = await call('tools/call', {
      name: 'echo',
      arguments: { message: 'hello' },
    });

    // Assert
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.text).toContain('"structuredContent":{"message":"hello"}');
  });
});
