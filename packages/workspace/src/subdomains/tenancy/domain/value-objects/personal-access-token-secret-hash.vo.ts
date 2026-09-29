/** The hash of a token's secret; the secret itself is never stored. */
export class PersonalAccessTokenSecretHash {
  readonly #value: string;

  constructor(value: string) {
    this.#value = value;
  }

  public get value(): string {
    return this.#value;
  }
}
