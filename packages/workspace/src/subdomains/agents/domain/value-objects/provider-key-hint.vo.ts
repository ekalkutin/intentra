/** A recognisable piece of a Provider Key, such as `sk-or-v1-…x7Qa`, safe to show. */
export class ProviderKeyHint {
  readonly #value: string;

  constructor(value: string) {
    this.#value = value;
  }

  public get value(): string {
    return this.#value;
  }
}
