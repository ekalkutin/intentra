export type Neighbours = {
  readonly previous: string | null;
  readonly next: string | null;
  /** From 1; null when the item is not in the list. */
  readonly position: number | null;
  readonly total: number;
};

/** The items before and after one Knowledge Key in a list the person stepped in from. */
export function neighboursOf(keys: readonly string[], key: string): Neighbours {
  const index = keys.indexOf(key);
  if (index === -1) {
    return { previous: null, next: null, position: null, total: keys.length };
  }

  return {
    previous: keys[index - 1] ?? null,
    next: keys[index + 1] ?? null,
    position: index + 1,
    total: keys.length,
  };
}
