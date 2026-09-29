import { NotFoundException } from '@intentra/shared-kernel';

export class MemberNotFoundException extends NotFoundException<'MEMBER_NOT_FOUND'> {
  constructor() {
    super('Member not found', 'MEMBER_NOT_FOUND');
  }
}
