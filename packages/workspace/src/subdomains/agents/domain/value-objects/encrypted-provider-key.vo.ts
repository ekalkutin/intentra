/** A Provider Key as it is stored: encrypted with the server's secret. */
export class EncryptedProviderKey {
  readonly #value: string;

  constructor(value: string) {
    this.#value = value;
  }

  public get value(): string {
    return this.#value;
  }
}
