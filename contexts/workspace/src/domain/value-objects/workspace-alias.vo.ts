import {
  InvalidWorkspaceAliasException,
  ReservedWorkspaceAliasException,
} from '../exceptions/index.js';

const SHAPE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 40;
/** First URL segments the web app uses for itself. */
const RESERVED = new Set(['api', 'auth', 'onboarding', 'workspaces']);

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
    if (RESERVED.has(normalized)) {
      throw new ReservedWorkspaceAliasException(normalized);
    }
    this.#value = normalized;
  }

  public get value(): string {
    return this.#value;
  }
}
