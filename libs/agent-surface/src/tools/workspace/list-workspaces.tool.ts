import { z } from 'zod';

import { WorkspaceDtoSchema } from '@intentra/contracts/workspace';

import { defineTool } from '../define-tool.js';

export const listWorkspacesTool = defineTool({
  id: 'list_workspaces',
  description: 'List the workspaces available to you.',
  input: z.object({}),
  output: z.object({ workspaces: z.array(WorkspaceDtoSchema) }),
  readOnly: true,
  exposure: { mcp: true, agents: true },
  async run(apis, _input, caller) {
    return {
      workspaces: await apis.workspace.workspaces.find(caller.accountId),
    };
  },
});
