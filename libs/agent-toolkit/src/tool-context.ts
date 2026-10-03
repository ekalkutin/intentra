import { z } from 'zod';

import {
  AgentKindDtoSchema,
  ProjectRoleDtoSchema,
  type CallerDto,
} from '@intentra/contracts/workspace';

import type { ToolApis } from './tool-apis.js';

/**
 * What every tool reads from Mastra's request context, set by whoever runs
 * the tools: the published APIs, who calls, and the Workspace they work in.
 * The caller comes only from here, never from a tool's input.
 */
export const toolContextSchema = z.object({
  apis: z.custom<ToolApis>(
    value => typeof value === 'object' && value !== null,
  ),
  caller: z.union([
    z.object({
      actor: z.object({
        accountId: z.string(),
        email: z.string(),
        name: z.string(),
        isPlatformAdmin: z.boolean(),
      }),
      agent: z
        .object({
          kind: AgentKindDtoSchema,
          level: ProjectRoleDtoSchema,
          projectId: z.string().nullable(),
        })
        .nullable(),
    }),
    // Intentra itself, in an Analysis Run.
    z.object({
      actor: z.null(),
      agent: z.object({
        kind: z.literal(AgentKindDtoSchema.enum['analysis-run']),
        level: z.literal(ProjectRoleDtoSchema.enum.contributor),
        projectId: z.string(),
      }),
    }),
  ]) satisfies z.ZodType<CallerDto>,
  workspaceId: z.string(),
});

/**
 * What the tools offered only over MCP read as well: the Workspace the
 * agent's token works in, so that the agent can tell the person where it is.
 */
export const mcpToolContextSchema = toolContextSchema.extend({
  workspace: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  }),
});
