import { describe, expect, it } from 'vitest';

import type { ToolApis } from '../define-tool.js';

import { listWorkspacesTool } from './list-workspaces.tool.js';

describe('list_workspaces', () => {
  it('wraps the workspaces into an object', async () => {
    const workspaces = [{ id: 'ws-1', name: 'Acme' }];
    const apis = {
      workspace: { workspaces: { find: async () => workspaces } },
    } as unknown as ToolApis;

    const result = await listWorkspacesTool.run(apis, {});

    expect(listWorkspacesTool.output.parse(result)).toEqual({ workspaces });
  });
});
