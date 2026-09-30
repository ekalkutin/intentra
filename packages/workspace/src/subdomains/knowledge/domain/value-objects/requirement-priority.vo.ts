import { InvalidKnowledgeFieldsException } from '../exceptions/index.js';

/** How much a Requirement matters: Must, Should or Could. */
export class RequirementPriority {
  public static readonly Must = new RequirementPriority('must');
  public static readonly Should = new RequirementPriority('should');
  public static readonly Could = new RequirementPriority('could');

  static readonly #all: readonly RequirementPriority[] = [
    RequirementPriority.Must,
    RequirementPriority.Should,
    RequirementPriority.Could,
  ];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): RequirementPriority {
    const choice = RequirementPriority.#all.find(
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
