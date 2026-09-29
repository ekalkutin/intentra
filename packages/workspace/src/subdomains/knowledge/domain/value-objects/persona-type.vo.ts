import { InvalidKnowledgeFieldsException } from '../exceptions/index.js';

/** Whether a Persona is a person or a system. */
export class PersonaType {
  public static readonly Person = new PersonaType('person');
  public static readonly System = new PersonaType('system');

  static readonly #all: readonly PersonaType[] = [
    PersonaType.Person,
    PersonaType.System,
  ];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): PersonaType {
    const choice = PersonaType.#all.find(
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
