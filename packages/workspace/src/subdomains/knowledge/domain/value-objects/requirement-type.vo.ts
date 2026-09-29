import { InvalidKnowledgeFieldsException } from '../exceptions/index.js';

/** Whether a Requirement is a function the system performs or a quality it has. */
export class RequirementType {
  public static readonly Functional = new RequirementType('functional');
  public static readonly NonFunctional = new RequirementType('non-functional');

  static readonly #all: readonly RequirementType[] = [
    RequirementType.Functional,
    RequirementType.NonFunctional,
  ];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): RequirementType {
    const choice = RequirementType.#all.find(
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
