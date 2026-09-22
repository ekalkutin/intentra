import { ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';
import { describe, expect, it } from 'vitest';

import type {
  AccountIdentity,
  Identity,
  ProjectDto,
} from '@intentra/workspace-contracts';

import { WorkspaceClientPort } from '../../../application/ports/index.js';
import { attachCaller } from '../../../infrastructure/mcp/caller.js';

import { listProjectsTool } from './list-projects.tool.js';

const ACCOUNT_ID = '00000000-0000-4000-8000-000000000001';
const WORKSPACE_ID = '00000000-0000-4000-8000-000000000002';

const PROJECT: ProjectDto = {
  id: '00000000-0000-4000-8000-000000000003',
  workspaceId: WORKSPACE_ID,
  name: 'Intentra',
  createdAt: '2026-09-22T00:00:00.000Z',
};

const unused = () => {
  throw new Error('Not part of this test');
};

/** Порт, запоминающий, кем его позвали: проверяем именно это. */
function workspaceRecording(asked: Identity[]): WorkspaceClientPort {
  return {
    workspaces: { create: unused, findMine: unused },
    projects: {
      create: unused,
      findMany: async (identity: Identity) => {
        asked.push(identity);

        return [PROJECT];
      },
    },
  };
}

type ToolContext = Parameters<
  NonNullable<ReturnType<typeof listProjectsTool>['execute']>
>[1];

/**
 * То же, что делает транспорт: кладёт вызывающего в запрос и переносит
 * `request.auth` в контекст инструмента.
 */
function calledBy(caller: AccountIdentity): ToolContext {
  const request = {} as Request;

  attachCaller(request, caller, 'access-token');

  return {
    mcp: { extra: { authInfo: (request as { auth?: unknown }).auth } },
  } as unknown as ToolContext;
}

describe('list_projects', () => {
  it('спрашивает Workspace от имени того, кого назвал токен, в том workspace, который назвал аргумент', async () => {
    const asked: Identity[] = [];
    const tool = listProjectsTool(workspaceRecording(asked));

    const result = await tool.execute?.(
      { workspaceId: WORKSPACE_ID },
      calledBy({ accountId: ACCOUNT_ID, isPlatformAdmin: false }),
    );

    expect(asked).toEqual([
      {
        accountId: ACCOUNT_ID,
        isPlatformAdmin: false,
        workspaceId: WORKSPACE_ID,
      },
    ]);
    expect(result).toEqual({ projects: [PROJECT] });
  });

  it('отказ контекста пересказывает одной фразой, без устройства продукта внутри', async () => {
    const tool = listProjectsTool({
      workspaces: { create: unused, findMine: unused },
      projects: {
        create: unused,
        findMany: async () => {
          throw new ForbiddenException('Нет доступа в этот workspace', {
            description: 'NOT_A_MEMBER',
          });
        },
      },
    });

    await expect(
      tool.execute?.(
        { workspaceId: WORKSPACE_ID },
        calledBy({ accountId: ACCOUNT_ID, isPlatformAdmin: false }),
      ),
    ).rejects.toThrow(
      'Not available to the calling account, or it does not exist.',
    );
  });

  it('не работает без проверенного вызывающего: пустой контекст — ошибка сборки двери, а не отказ доступа', async () => {
    const tool = listProjectsTool(workspaceRecording([]));

    await expect(
      tool.execute?.({ workspaceId: WORKSPACE_ID }, {} as ToolContext),
    ).rejects.toThrow(/No caller on the MCP request/);
  });
});
