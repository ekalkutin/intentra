const HOURS_PER_DAY = 24;

/**
 * A point in time. Wraps `Temporal.Instant`: the code never touches `Date`,
 * which stays only where a library needs it (a database driver).
 */
export class Timestamp {
  readonly #instant: Temporal.Instant;

  private constructor(instant: Temporal.Instant) {
    this.#instant = instant;
  }

  public static now(): Timestamp {
    return new Timestamp(Temporal.Now.instant());
  }

  /** An ISO 8601 string with a zone, such as `2026-01-01T00:00:00Z`. */
  public static from(iso: string): Timestamp {
    return new Timestamp(Temporal.Instant.from(iso));
  }

  public static fromDate(date: Date): Timestamp {
    return new Timestamp(
      Temporal.Instant.fromEpochMilliseconds(date.getTime()),
    );
  }

  /** A day is 24 hours here: an instant has no calendar or time zone. */
  public addDays(days: number): Timestamp {
    return new Timestamp(this.#instant.add({ hours: days * HOURS_PER_DAY }));
  }

  public isBefore(other: Timestamp): boolean {
    return Temporal.Instant.compare(this.#instant, other.#instant) < 0;
  }

  public equals(other: Timestamp): boolean {
    return this.#instant.equals(other.#instant);
  }

  public toDate(): Date {
    return new Date(this.#instant.epochMilliseconds);
  }

  /** ISO 8601 in milliseconds, as stored: a fresh and a read-back one match. */
  public toString(): string {
    return this.#instant.toString({ smallestUnit: 'millisecond' });
  }

  public toJSON(): string {
    return this.toString();
  }
}
