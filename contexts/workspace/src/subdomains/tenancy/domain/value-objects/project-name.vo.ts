/** Как проект называется. Те же границы, что у имени workspace: их читают в одних и тех же списках. */
export class ProjectName {
  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      throw new Error('Project name cannot be empty');
    }

    if (trimmed.length > ProjectName.MAX_LENGTH) {
      throw new Error(
        `Project name cannot exceed ${ProjectName.MAX_LENGTH} characters`,
      );
    }

    this.#value = trimmed;
  }

  private static readonly MAX_LENGTH = 80;

  public get value(): string {
    return this.#value;
  }

  public toString(): string {
    return this.#value;
  }
}
