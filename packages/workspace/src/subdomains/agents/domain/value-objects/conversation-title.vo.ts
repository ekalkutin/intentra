import { InvalidConversationTitleException } from '../exceptions/index.js';

const MAX_LENGTH = 200;

export class ConversationTitle {
  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidConversationTitleException();
    }
    this.#value = trimmed;
  }

  public get value(): string {
    return this.#value;
  }
}
