import { InvalidWorkspaceAliasException } from '../exceptions/index.js';

const SHAPE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 40;

/** The workspace's address: `intentra.app/acme-labs`. Unique across Intentra. */
export class WorkspaceAlias {
  readonly #value: string;

  constructor(value: string) {
    const normalized = value.trim().toLowerCase();
    if (
      normalized.length < MIN_LENGTH ||
      normalized.length > MAX_LENGTH ||
      !SHAPE.test(normalized)
    ) {
      throw new InvalidWorkspaceAliasException(MIN_LENGTH, MAX_LENGTH);
    }
    this.#value = normalized;
  }

  public get value(): string {
    return this.#value;
  }
}
