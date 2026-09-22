import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { ProjectSchema } from '@intentra/workspace-contracts';

import { WorkspaceClientPort } from '../../../application/ports/index.js';
import { callerOf } from '../../../infrastructure/mcp/caller.js';
import { translateRefusal } from '../../../infrastructure/mcp/refusal.js';

/**
 * Проекты одного workspace.
 *
 * В HTTP-фасаде workspace называет адрес запроса, и назвать в теле другой
 * невозможно. Здесь адрес один на все вызовы, поэтому `workspaceId` приходит
 * аргументом — и это безопасно ровно потому, что на него никто не полагается:
 * `accountId` берётся из проверенного токена, а Workspace на каждый вызов
 * заново проверяет, состоит ли этот человек в названном workspace, и сужает
 * список до выданных ему проектов. Назвать чужой workspace можно; получить его
 * содержимое — нет.
 */
export const listProjectsTool = (workspace: WorkspaceClientPort) =>
  createTool({
    id: 'list_projects',
    description:
      'Lists the projects the calling account can see in one workspace. Returns an empty list when the account is a member but no project has been shared with it.',
    inputSchema: z.object({
      workspaceId: z
        .uuid()
        .describe('Workspace to look in, as returned by list_workspaces.'),
    }),
    outputSchema: z.object({ projects: z.array(ProjectSchema) }),
    execute: async ({ workspaceId }, context) => ({
      projects: await translateRefusal(
        workspace.projects.findMany({ ...callerOf(context), workspaceId }),
      ),
    }),
  });
