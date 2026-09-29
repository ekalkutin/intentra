import { UnknownMemberStatusException } from '../exceptions/index.js';

export class MemberStatus {
  public static readonly Active = new MemberStatus('active');
  public static readonly Removed = new MemberStatus('removed');

  static readonly #all: readonly MemberStatus[] = [
    MemberStatus.Active,
    MemberStatus.Removed,
  ];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): MemberStatus {
    const status = MemberStatus.#all.find(status => status.value === value);
    if (!status) {
      throw new UnknownMemberStatusException();
    }

    return status;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: MemberStatus): boolean {
    return other.value === this.#value;
  }
}
