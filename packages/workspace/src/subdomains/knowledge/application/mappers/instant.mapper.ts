/** Mongo keeps milliseconds: a date must read the same before and after a round trip. */
export function toIsoString(instant: Temporal.Instant): string {
  return instant.toString({ smallestUnit: 'millisecond' });
}
