import { ConflictException } from '@intentra/shared-kernel';

export class OrchestratorNotRemovableException extends ConflictException<'ORCHESTRATOR_NOT_REMOVABLE'> {
  constructor() {
    super(
      'There is always one Orchestrator: it can be changed but not removed',
      'ORCHESTRATOR_NOT_REMOVABLE',
    );
  }
}
