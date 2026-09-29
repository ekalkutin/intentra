import { InvalidEmailException } from '../../exceptions/index.js';

const SHAPE = /^[^\s@]+@[^\s@]+$/;

/** Stored lower-case, so one address is the same in any case. */
export class Email {
  readonly #value: string;

  constructor(value: string) {
    const normalized = value.trim().toLowerCase();
    if (!SHAPE.test(normalized)) {
      throw new InvalidEmailException();
    }
    this.#value = normalized;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: Email): boolean {
    return other.value === this.#value;
  }
}
