import { InvalidModelProfileException } from '../exceptions/index.js';

/** How much a model thinks before it answers. */
export class ReasoningEffort {
  public static readonly Low = new ReasoningEffort('low');
  public static readonly Medium = new ReasoningEffort('medium');
  public static readonly High = new ReasoningEffort('high');

  static readonly #all: readonly ReasoningEffort[] = [
    ReasoningEffort.Low,
    ReasoningEffort.Medium,
    ReasoningEffort.High,
  ];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): ReasoningEffort {
    const effort = ReasoningEffort.#all.find(
      candidate => candidate.value === value,
    );
    if (!effort) {
      throw new InvalidModelProfileException(
        'Reasoning effort must be low, medium or high',
      );
    }

    return effort;
  }

  public get value(): string {
    return this.#value;
  }
}
