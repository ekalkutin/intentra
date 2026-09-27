import { z } from 'zod';

import { WorkspaceDtoSchema } from '@intentra/contracts/workspace';

import { defineTool } from '../../define-tool.js';

// Until authorization exists this lists every workspace; once there is a
// caller, it must list only the workspaces the caller is a member of.
export const listWorkspacesTool = defineTool({
  id: 'list_workspaces',
  description: 'List the workspaces available to you.',
  input: z.object({}),
  output: z.object({ workspaces: z.array(WorkspaceDtoSchema) }),
  readOnly: true,
  exposure: { mcp: true, agents: true },
  async run(apis) {
    return { workspaces: await apis.workspace.workspaces.find() };
  },
});
