import { Aggregate, Email, WorkspaceId } from '@intentra/shared-kernel';

import {
  InvitationExpiredException,
  InvitationNotPendingException,
} from '../exceptions/index.js';
import {
  InvitationId,
  InvitationStatus,
  MemberId,
} from '../value-objects/index.js';

const LIFETIME: Temporal.DurationLike = { hours: 7 * 24 };

export class Invitation extends Aggregate<InvitationId> {
  readonly #workspaceId: WorkspaceId;
  readonly #email: Email;
  #invitedBy: MemberId;
  #sentAt: Temporal.Instant;
  #expiresAt: Temporal.Instant;
  #status: InvitationStatus;

  private constructor(id: InvitationId, state: InvitationState) {
    super(id);
    this.#workspaceId = state.workspaceId;
    this.#email = state.email;
    this.#invitedBy = state.invitedBy;
    this.#sentAt = state.sentAt;
    this.#expiresAt = state.expiresAt;
    this.#status = state.status;
  }

  get workspaceId(): WorkspaceId {
    return this.#workspaceId;
  }

  get email(): Email {
    return this.#email;
  }

  get invitedBy(): MemberId {
    return this.#invitedBy;
  }

  get sentAt(): Temporal.Instant {
    return this.#sentAt;
  }

  get expiresAt(): Temporal.Instant {
    return this.#expiresAt;
  }

  get status(): InvitationStatus {
    const expired =
      Temporal.Instant.compare(Temporal.Now.instant(), this.#expiresAt) >= 0;
    if (this.#status.equals(InvitationStatus.Pending) && expired) {
      return InvitationStatus.Expired;
    }

    return this.#status;
  }

  public static create(props: InvitationCreateProps): Invitation {
    const now = Temporal.Now.instant();

    return new Invitation(new InvitationId(), {
      workspaceId: new WorkspaceId(props.workspaceId),
      email: new Email(props.email),
      invitedBy: new MemberId(props.invitedBy),
      sentAt: now,
      expiresAt: now.add(LIFETIME),
      status: InvitationStatus.Pending,
    });
  }

  public static restore(props: InvitationRestoreProps): Invitation {
    return new Invitation(new InvitationId(props.id), {
      workspaceId: new WorkspaceId(props.workspaceId),
      email: new Email(props.email),
      invitedBy: new MemberId(props.invitedBy),
      sentAt: props.sentAt,
      expiresAt: props.expiresAt,
      status: InvitationStatus.from(props.status),
    });
  }

  public isPending(): boolean {
    return this.status.equals(InvitationStatus.Pending);
  }

  public isAddressedTo(email: Email): boolean {
    return this.#email.equals(email);
  }

  public accept(): void {
    this.#close(InvitationStatus.Accepted);
  }

  public decline(): void {
    this.#close(InvitationStatus.Declined);
  }

  public revoke(): void {
    this.#close(InvitationStatus.Revoked);
  }

  public reopen(invitedBy: MemberId): void {
    const now = Temporal.Now.instant();
    this.#invitedBy = invitedBy;
    this.#sentAt = now;
    this.#expiresAt = now.add(LIFETIME);
    this.#status = InvitationStatus.Pending;
  }

  #close(status: InvitationStatus): void {
    const current = this.status;
    if (current.equals(InvitationStatus.Expired)) {
      throw new InvitationExpiredException();
    }
    if (!current.equals(InvitationStatus.Pending)) {
      throw new InvitationNotPendingException();
    }
    this.#status = status;
  }
}

type InvitationState = {
  readonly workspaceId: WorkspaceId;
  readonly email: Email;
  readonly invitedBy: MemberId;
  readonly sentAt: Temporal.Instant;
  readonly expiresAt: Temporal.Instant;
  readonly status: InvitationStatus;
};
type InvitationCreateProps = {
  readonly workspaceId: string;
  readonly email: string;
  readonly invitedBy: string;
};
type InvitationRestoreProps = {
  readonly id: string;
  readonly workspaceId: string;
  readonly email: string;
  readonly invitedBy: string;
  readonly sentAt: Temporal.Instant;
  readonly expiresAt: Temporal.Instant;
  readonly status: string;
};
