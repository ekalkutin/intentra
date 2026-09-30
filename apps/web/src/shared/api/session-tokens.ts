import { z } from 'zod';

import type { TokenPair } from '@intentra/contracts/iam';

import { readStored, removeStored, writeStored } from '../lib';

const STORAGE_KEY = 'intentra.session';

const TokenPairSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
}) satisfies z.ZodType<TokenPair>;

type Listener = () => void;

const listeners = new Set<Listener>();
let current: TokenPair | null = read();

function read(): TokenPair | null {
  const parsed = TokenPairSchema.safeParse(readStored(STORAGE_KEY));
  return parsed.success ? parsed.data : null;
}

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

// Another tab signed in, refreshed or signed out.
window.addEventListener('storage', event => {
  if (event.key === STORAGE_KEY || event.key === null) {
    current = read();
    notify();
  }
});

/**
 * The signed-in Account's token pair, kept in localStorage so that it
 * survives a reload and is shared by every tab of the app (ADR 0003).
 */
export const sessionTokens = {
  get(): TokenPair | null {
    return current;
  },

  set(pair: TokenPair): void {
    current = pair;
    writeStored(STORAGE_KEY, pair);
    notify();
  },

  clear(): void {
    current = null;
    removeStored(STORAGE_KEY);
    notify();
  },

  /** Called on every change, in this tab or another; returns the unsubscribe. */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
