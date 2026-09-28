export class MemberStatus {
  public static readonly Active = new MemberStatus('active');
  public static readonly Removed = new MemberStatus('removed');

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: MemberStatus): boolean {
    return other.value === this.#value;
  }
}
