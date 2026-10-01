/** A primitive picture of an object, for telling what changed. */
export type Comparable = Readonly<
  Record<string, string | number | null | readonly string[]>
>;

/** The keys whose values differ; lists count as sets. */
export function changedFields(
  current: Comparable,
  earlier: Comparable,
): string[] {
  return Object.keys(current).filter(
    key => normalize(current[key]) !== normalize(earlier[key]),
  );
}

function normalize(value: Comparable[string] | undefined): string {
  return JSON.stringify(Array.isArray(value) ? [...value].sort() : value);
}
