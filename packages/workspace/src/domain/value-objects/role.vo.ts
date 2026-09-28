/** What a Member may do inside Projects. Ownership is not a Role: it belongs to the Workspace. */
export class Role {
  public static readonly Contributor = new Role('contributor');

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: Role): boolean {
    return other.value === this.#value;
  }
}
