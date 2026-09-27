import { randomUUID } from 'node:crypto';

export abstract class EntityId {
  /**
   * `#`, not `protected`: no subclass reads or replaces the identity value,
   * they only add a type brand. So nobody can replace it later either, and
   * that is enforced at runtime, not by convention.
   */
  readonly #value: string;

  constructor(value?: string) {
    const resolved = value ?? randomUUID();
    this.validate(resolved);
    this.#value = resolved;
  }

  /**
   * `protected` because it is an extension point: a subclass that needs a
   * stricter format than a non-empty string overrides it. A private name cannot
   * be overridden: the base would call its own.
   */
  protected validate(value: string): void {
    if (!value) {
      throw new Error('EntityId cannot be empty');
    }
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: this): boolean {
    return other.value === this.#value;
  }

  public toJSON(): string {
    return this.#value;
  }

  public toString(): string {
    return this.#value;
  }
}
