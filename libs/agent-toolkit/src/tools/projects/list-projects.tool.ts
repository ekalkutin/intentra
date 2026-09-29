import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { ProjectRoleDtoSchema } from '@intentra/contracts/workspace';

import { toolContextSchema } from '../../tool-context.js';

export const listProjectsTool = createTool({
  id: 'list_projects',
  description:
    "Lists the Projects of the Workspace with their ids, which every other tool takes. Match the name the person uses to a Project here. In each Project you may do what the lower of your token's level and the person's Project Role allows.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    projects: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        role: ProjectRoleDtoSchema.describe("The person's Project Role in it."),
      }),
    ),
    tokenLevel: ProjectRoleDtoSchema.nullable().describe(
      'The level of the token you work with.',
    ),
  }),
  requestContextSchema: toolContextSchema,
  mcp: { annotations: { readOnlyHint: true } },
  execute: async (_, { requestContext }) => {
    const { workspace } = requestContext.get('apis');
    const caller = requestContext.get('caller');
    const workspaceId = requestContext.get('workspaceId');
    const projects = await workspace.projects.list(caller.actor, workspaceId);
    const access = await workspace.access.get(caller.actor, workspaceId);

    return {
      projects: projects.map(project => ({
        ...project,
        role:
          access.projects[project.id]?.role ?? ProjectRoleDtoSchema.enum.viewer,
      })),
      tokenLevel: caller.agent?.level ?? null,
    };
  },
});
