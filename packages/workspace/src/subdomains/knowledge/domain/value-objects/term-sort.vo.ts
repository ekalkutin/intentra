import { InvalidKnowledgeFieldsException } from '../exceptions/index.js';

/** What sort of concept a Term names. */
export class TermSort {
  public static readonly Entity = new TermSort('entity');
  public static readonly Value = new TermSort('value');
  public static readonly Role = new TermSort('role');
  public static readonly ActionEvent = new TermSort('action-event');
  public static readonly Other = new TermSort('other');

  static readonly #all: readonly TermSort[] = [
    TermSort.Entity,
    TermSort.Value,
    TermSort.Role,
    TermSort.ActionEvent,
    TermSort.Other,
  ];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): TermSort {
    const choice = TermSort.#all.find(candidate => candidate.value === value);
    if (!choice) {
      throw new InvalidKnowledgeFieldsException();
    }

    return choice;
  }

  public get value(): string {
    return this.#value;
  }
}
