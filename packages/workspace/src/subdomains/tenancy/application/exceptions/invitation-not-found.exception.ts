import { NotFoundException } from '@intentra/shared-kernel';

export class InvitationNotFoundException extends NotFoundException<'INVITATION_NOT_FOUND'> {
  constructor() {
    super('Invitation not found', 'INVITATION_NOT_FOUND');
  }
}
