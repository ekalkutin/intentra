import { InvalidRejectionReasonException } from '../exceptions/index.js';

const MAX_LENGTH = 2000;

/** Why a person turned a Draft down. */
export class RejectionReason {
  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidRejectionReasonException();
    }
    this.#value = trimmed;
  }

  /** A blank reason means none was given. */
  public static optional(value: string | null): RejectionReason | null {
    return value === null || value.trim().length === 0
      ? null
      : new RejectionReason(value);
  }

  public get value(): string {
    return this.#value;
  }
}
