import { UnknownInvitationStatusException } from '../exceptions/index.js';

export class InvitationStatus {
  public static readonly Pending = new InvitationStatus('pending');
  public static readonly Accepted = new InvitationStatus('accepted');
  public static readonly Declined = new InvitationStatus('declined');
  public static readonly Revoked = new InvitationStatus('revoked');
  public static readonly Expired = new InvitationStatus('expired');

  static readonly #all: readonly InvitationStatus[] = [
    InvitationStatus.Pending,
    InvitationStatus.Accepted,
    InvitationStatus.Declined,
    InvitationStatus.Revoked,
  ];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): InvitationStatus {
    const status = InvitationStatus.#all.find(status => status.value === value);
    if (!status) {
      throw new UnknownInvitationStatusException();
    }

    return status;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: InvitationStatus): boolean {
    return other.value === this.#value;
  }
}
