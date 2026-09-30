import { useSyncExternalStore } from 'react';

import { sessionTokens } from '@/shared/api';

/** Whether someone is signed in, for code outside React (route loaders). */
export function hasSession(): boolean {
  return sessionTokens.get() !== null;
}

/** Whether someone is signed in; follows sign-ins and sign-outs in every tab. */
export function useHasSession(): boolean {
  return useSyncExternalStore(sessionTokens.subscribe, hasSession);
}

/** Forgets the session; the server keeps none to end (ADR 0003). */
export function endSession(): void {
  sessionTokens.clear();
}
