/** A recognisable piece of a token's secret, such as `intr_…x7Qa`, safe to show. */
export class PersonalAccessTokenSecretHint {
  readonly #value: string;

  constructor(value: string) {
    this.#value = value;
  }

  public get value(): string {
    return this.#value;
  }
}
