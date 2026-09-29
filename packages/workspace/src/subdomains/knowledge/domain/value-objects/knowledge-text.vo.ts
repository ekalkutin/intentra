import { InvalidKnowledgeFieldsException } from '../exceptions/index.js';

const MAX_LENGTH = 5000;

/** One text field of a Kind, such as a Term's definition or an acceptance criterion. */
export class KnowledgeText {
  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidKnowledgeFieldsException();
    }
    this.#value = trimmed;
  }

  /** A blank optional text means it is not given. */
  public static optional(value: string | null): KnowledgeText | null {
    return value === null || value.trim().length === 0
      ? null
      : new KnowledgeText(value);
  }

  public get value(): string {
    return this.#value;
  }
}
