import { DomainEvent } from '@intentra/shared';

export class ProjectCreatedEvent extends DomainEvent {
  constructor(
    public readonly projectId: string,
    public readonly workspaceId: string,
    public readonly name: string,
  ) {
    super();
  }
}
