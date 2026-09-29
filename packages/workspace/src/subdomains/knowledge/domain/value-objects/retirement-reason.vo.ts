import { InvalidRetirementReasonException } from '../exceptions/index.js';

const MAX_LENGTH = 2000;

/** Why a person retired an Approved item. */
export class RetirementReason {
  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidRetirementReasonException();
    }
    this.#value = trimmed;
  }

  /** A blank reason means none was given. */
  public static optional(value: string | null): RetirementReason | null {
    return value === null || value.trim().length === 0
      ? null
      : new RetirementReason(value);
  }

  public get value(): string {
    return this.#value;
  }
}
