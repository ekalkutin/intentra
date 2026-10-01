import { AgentsVersionNotFoundException } from '../exceptions/index.js';

/** An Agents Version's number: 1, 2, 3… in the order they were published. */
export class AgentsVersionNumber {
  public static readonly One = new AgentsVersionNumber(1);

  readonly #value: number;

  constructor(value: number) {
    if (!Number.isInteger(value) || value < 1) {
      // No Agents Version has such a number.
      throw new AgentsVersionNotFoundException();
    }
    this.#value = value;
  }

  public get value(): number {
    return this.#value;
  }

  public next(): AgentsVersionNumber {
    return new AgentsVersionNumber(this.#value + 1);
  }
}
