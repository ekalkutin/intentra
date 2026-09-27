import { DomainException } from '@intentra/shared';

export class OrchestratorCannotBeArchivedException extends DomainException<'ORCHESTRATOR_CANNOT_BE_ARCHIVED'> {
  constructor() {
    super(
      'The orchestrator of a workspace cannot be deleted',
      'ORCHESTRATOR_CANNOT_BE_ARCHIVED',
    );
  }
}
