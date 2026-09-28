import { randomUUID } from 'node:crypto';

export abstract class EntityId {
  readonly #value: string;

  constructor(value?: string) {
    const resolved = value ?? randomUUID();
    this.validate(resolved);
    this.#value = resolved;
  }

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
