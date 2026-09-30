import { InvalidWorkspaceSlugException } from '../exceptions/index.js';

const SHAPE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 15;

export class WorkspaceSlug {
  readonly #value: string;

  constructor(value: string) {
    if (
      value.length < MIN_LENGTH ||
      value.length > MAX_LENGTH ||
      !SHAPE.test(value)
    ) {
      throw new InvalidWorkspaceSlugException();
    }
    this.#value = value;
  }

  public get value(): string {
    return this.#value;
  }
}
