import { NotFoundException } from '@intentra/shared-kernel';

export class ModelProfileNotFoundException extends NotFoundException<'MODEL_PROFILE_NOT_FOUND'> {
  constructor() {
    super('Model profile not found', 'MODEL_PROFILE_NOT_FOUND');
  }
}
