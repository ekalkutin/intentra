import { InvalidKnowledgeFieldsException } from '../exceptions/index.js';

/** Which way an Integration exchanges: we send to them, they send to us, or both. */
export class IntegrationDirection {
  public static readonly Outbound = new IntegrationDirection('outbound');
  public static readonly Inbound = new IntegrationDirection('inbound');
  public static readonly Both = new IntegrationDirection('both');

  static readonly #all: readonly IntegrationDirection[] = [
    IntegrationDirection.Outbound,
    IntegrationDirection.Inbound,
    IntegrationDirection.Both,
  ];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): IntegrationDirection {
    const choice = IntegrationDirection.#all.find(
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
