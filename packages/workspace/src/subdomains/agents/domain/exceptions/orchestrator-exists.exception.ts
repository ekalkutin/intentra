import { ConflictException } from '@intentra/shared-kernel';

export class OrchestratorExistsException extends ConflictException<'ORCHESTRATOR_EXISTS'> {
  constructor() {
    super(
      'There is already an Orchestrator: change it instead of adding another',
      'ORCHESTRATOR_EXISTS',
    );
  }
}
