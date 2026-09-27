import { describe, expect, it, vi } from 'vitest';

import type { ToolApis } from '../../surface.js';

import { listWorkspacesTool } from './list-workspaces.tool.js';

describe('list_workspaces', () => {
  it('wraps the workspaces of the caller into an object', async () => {
    const workspaces = [{ id: 'ws-1', name: 'Acme', alias: 'acme' }];
    const find = vi.fn(async () => workspaces);
    const apis = { workspace: { workspaces: { find } } } as unknown as ToolApis;

    const result = await listWorkspacesTool.run(
      apis,
      {},
      { accountId: 'acc-1' },
    );

    expect(find).toHaveBeenCalledWith('acc-1');
    expect(listWorkspacesTool.output.parse(result)).toEqual({ workspaces });
  });
});
