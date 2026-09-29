import { InvalidKnowledgeFieldsException } from '../exceptions/index.js';

/** What a Decision is about. */
export class DecisionArea {
  public static readonly Architecture = new DecisionArea('architecture');
  public static readonly Product = new DecisionArea('product');
  public static readonly Business = new DecisionArea('business');

  static readonly #all: readonly DecisionArea[] = [
    DecisionArea.Architecture,
    DecisionArea.Product,
    DecisionArea.Business,
  ];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): DecisionArea {
    const choice = DecisionArea.#all.find(
      candidate => candidate.value === value,
    );
    if (!choice) {
      throw new InvalidKnowledgeFieldsException();
    }

    return choice;
  }

  public get value(): string {
    return this.#value;
  }
}
