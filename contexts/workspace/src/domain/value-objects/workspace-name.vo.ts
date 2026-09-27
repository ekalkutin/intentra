import { InvalidWorkspaceNameException } from '../exceptions/index.js';

const MAX_LENGTH = 80;

/** What members call the workspace: "Acme Labs". Unlike the alias, not unique. */
export class WorkspaceName {
  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > MAX_LENGTH) {
      throw new InvalidWorkspaceNameException(MAX_LENGTH);
    }
    this.#value = trimmed;
  }

  public get value(): string {
    return this.#value;
  }
}
