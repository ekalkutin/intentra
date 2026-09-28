import type { Actor } from '@intentra/contracts/iam';

/** Where `ActorGuard` leaves the Actor on the request. */
export const ACTOR = Symbol('actor');

export type ActorRequest = {
  readonly headers: Readonly<Record<string, string | string[] | undefined>>;
  [ACTOR]?: Actor;
};
