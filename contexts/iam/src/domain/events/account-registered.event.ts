import { DomainEvent } from '@intentra/shared';

export class AccountRegisteredEvent extends DomainEvent {
  constructor(
    public readonly accountId: string,
    public readonly email: string,
  ) {
    super();
  }
}
