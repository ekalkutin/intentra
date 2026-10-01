import { ConflictException } from '@intentra/shared-kernel';

export class ModelProfileInUseException extends ConflictException<'MODEL_PROFILE_IN_USE'> {
  constructor(agentNames: readonly string[]) {
    super(
      `The model profile is in use by ${agentNames.join(', ')}`,
      'MODEL_PROFILE_IN_USE',
    );
  }
}
