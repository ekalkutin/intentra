import { InvalidProjectSlugException } from '../exceptions/index.js';

const SHAPE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 15;

export class ProjectSlug {
  readonly #value: string;

  constructor(value: string) {
    if (
      value.length < MIN_LENGTH ||
      value.length > MAX_LENGTH ||
      !SHAPE.test(value)
    ) {
      throw new InvalidProjectSlugException();
    }
    this.#value = value;
  }

  public get value(): string {
    return this.#value;
  }
}
