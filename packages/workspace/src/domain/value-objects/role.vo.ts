import { UnknownRoleException } from '../exceptions/index.js';

export class Role {
  public static readonly Contributor = new Role('contributor');

  static readonly #all: readonly Role[] = [Role.Contributor];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): Role {
    const role = Role.#all.find(candidate => candidate.value === value);
    if (!role) {
      throw new UnknownRoleException();
    }

    return role;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: Role): boolean {
    return other.value === this.#value;
  }
}
