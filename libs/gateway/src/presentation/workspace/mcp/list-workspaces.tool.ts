import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { WorkspaceSchema } from '@intentra/workspace-contracts';

import { WorkspaceClientPort } from '../../../application/ports/index.js';
import { callerOf } from '../../../infrastructure/mcp/caller.js';
import { translateRefusal } from '../../../infrastructure/mcp/refusal.js';

/**
 * Точка входа для агента: без workspace остальные инструменты позвать нечем.
 *
 * Отвечает тем же, чем отвечает продукт своему владельцу, — только те
 * workspace, в которых человек состоит.
 */
export const listWorkspacesTool = (workspace: WorkspaceClientPort) =>
  createTool({
    id: 'list_workspaces',
    description:
      'Lists the workspaces the calling account belongs to. Call this first: every other tool needs a workspaceId from this list.',
    inputSchema: z.object({}),
    /* Схема ответа — та же, которой продукт отвечает браузеру: у фасада
       собственного языка нет, и заводить второй здесь не за чем. Объект, а не
       массив: `structuredContent` протокола — всегда объект. */
    outputSchema: z.object({ workspaces: z.array(WorkspaceSchema) }),
    execute: async (_input, context) => ({
      workspaces: await translateRefusal(
        workspace.workspaces.findMine(callerOf(context)),
      ),
    }),
  });
