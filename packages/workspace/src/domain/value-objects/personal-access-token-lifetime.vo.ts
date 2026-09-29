import { InvalidPersonalAccessTokenLifetimeException } from '../exceptions/index.js';

/** How long a Personal Access Token works after it is created. */
export class PersonalAccessTokenLifetime {
  public static readonly ThirtyDays = new PersonalAccessTokenLifetime(30);
  public static readonly NinetyDays = new PersonalAccessTokenLifetime(90);
  public static readonly OneYear = new PersonalAccessTokenLifetime(365);
  public static readonly Never = new PersonalAccessTokenLifetime(null);

  static readonly #all: readonly PersonalAccessTokenLifetime[] = [
    PersonalAccessTokenLifetime.ThirtyDays,
    PersonalAccessTokenLifetime.NinetyDays,
    PersonalAccessTokenLifetime.OneYear,
    PersonalAccessTokenLifetime.Never,
  ];

  readonly #days: number | null;

  private constructor(days: number | null) {
    this.#days = days;
  }

  /** Null means the token never expires. */
  public static fromDays(days: number | null): PersonalAccessTokenLifetime {
    const lifetime = PersonalAccessTokenLifetime.#all.find(
      candidate => candidate.days === days,
    );
    if (!lifetime) {
      throw new InvalidPersonalAccessTokenLifetimeException();
    }

    return lifetime;
  }

  public get days(): number | null {
    return this.#days;
  }

  /** Null for a token that never expires. */
  public expiresAt(from: Temporal.Instant): Temporal.Instant | null {
    return this.#days === null ? null : from.add({ hours: this.#days * 24 });
  }
}
