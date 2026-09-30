import { z } from 'zod';

import { readStored, removeStored, writeStored } from '@/shared/lib';

const STORAGE_KEY = 'intentra.lastWorkspace';

/** The slug of the Workspace the person was in last, to open it again. */
export function readLastWorkspaceSlug(): string | null {
  return z.string().nullable().catch(null).parse(readStored(STORAGE_KEY));
}

export function rememberLastWorkspaceSlug(slug: string): void {
  writeStored(STORAGE_KEY, slug);
}

export function forgetLastWorkspaceSlug(): void {
  removeStored(STORAGE_KEY);
}
