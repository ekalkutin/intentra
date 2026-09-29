import { UnknownRoleException } from '../exceptions/index.js';

/** What a Member may do in the Workspace beyond being a Member; a Member may have none. */
export class Role {
  public static readonly Owner = new Role('owner');
  public static readonly Manager = new Role('manager');

  static readonly #all: readonly Role[] = [Role.Owner, Role.Manager];

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
