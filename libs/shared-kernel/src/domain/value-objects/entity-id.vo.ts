import { randomUUID } from 'node:crypto';

import { InvalidEntityIdException } from '../../exceptions/index.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export abstract class EntityId {
  readonly #value: string;

  constructor(value?: string) {
    const resolved = value ?? randomUUID();
    this.validate(resolved);
    this.#value = resolved;
  }

  protected validate(value: string): void {
    if (!UUID.test(value)) {
      throw new InvalidEntityIdException();
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
