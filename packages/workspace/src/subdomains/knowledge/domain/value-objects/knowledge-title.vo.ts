import { InvalidKnowledgeTitleException } from '../exceptions/index.js';

const MAX_LENGTH = 200;

export class KnowledgeTitle {
  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidKnowledgeTitleException();
    }
    this.#value = trimmed;
  }

  public get value(): string {
    return this.#value;
  }
}
