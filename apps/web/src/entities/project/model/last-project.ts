import { z } from 'zod';

import { readStored, writeStored } from '@/shared/lib';

const STORAGE_KEY = 'intentra.lastProjects';

const LastProjectsSchema = z.record(z.string(), z.string()).catch({});

/** The slug of the Project the person opened last in a Workspace. */
export function readLastProjectSlug(workspaceId: string): string | null {
  return LastProjectsSchema.parse(readStored(STORAGE_KEY))[workspaceId] ?? null;
}

export function rememberLastProjectSlug(
  workspaceId: string,
  slug: string,
): void {
  const last = LastProjectsSchema.parse(readStored(STORAGE_KEY));
  writeStored(STORAGE_KEY, { ...last, [workspaceId]: slug });
}
