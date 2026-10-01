import { InvalidAgentException } from '../exceptions/index.js';

const PATTERN = /^[a-z][a-z0-9_]{0,63}$/;

/** A tool's id in the code's catalog, such as `list_knowledge`. */
export class ToolName {
  readonly #value: string;

  constructor(value: string) {
    if (!PATTERN.test(value)) {
      throw new InvalidAgentException(`"${value}" is not a tool name`);
    }
    this.#value = value;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: ToolName): boolean {
    return other.value === this.#value;
  }
}
