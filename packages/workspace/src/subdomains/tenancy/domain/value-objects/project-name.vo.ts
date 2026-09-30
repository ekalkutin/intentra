import { InvalidProjectNameException } from '../exceptions/index.js';

const MAX_LENGTH = 100;

export class ProjectName {
  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidProjectNameException();
    }
    this.#value = trimmed;
  }

  public get value(): string {
    return this.#value;
  }
}
