/** Как тенант называется. Пустое имя не бывает: в переключателе оно нечитаемо. */
export class WorkspaceName {
  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      throw new Error('Workspace name cannot be empty');
    }

    if (trimmed.length > WorkspaceName.MAX_LENGTH) {
      throw new Error(
        `Workspace name cannot exceed ${WorkspaceName.MAX_LENGTH} characters`,
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
