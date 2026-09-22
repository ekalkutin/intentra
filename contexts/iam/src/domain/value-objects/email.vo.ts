export class Email {
  readonly #value: string;

  constructor(value: string) {
    const normalized = value.trim().toLowerCase();

    if (!Email.LOOKS_LIKE_ADDRESS.test(normalized)) {
      throw new Error(`Not an email address: ${value}`);
    }

    this.#value = normalized;
  }

  private static readonly LOOKS_LIKE_ADDRESS = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  public get value(): string {
    return this.#value;
  }

  public equals(other: Email): boolean {
    return other.value === this.#value;
  }

  public toString(): string {
    return this.#value;
  }

  public static create(value: string): Email {
    return new Email(value);
  }
}
