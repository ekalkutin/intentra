import { DomainEvent } from '@intentra/shared';

export class WorkspaceCreatedEvent extends DomainEvent {
  constructor(
    public readonly workspaceId: string,
    public readonly name: string,
  ) {
    super();
  }
}
