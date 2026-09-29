import { NotFoundException } from '@intentra/shared-kernel';

export class LinkTargetNotFoundException extends NotFoundException<'LINK_TARGET_NOT_FOUND'> {
  constructor() {
    super(
      'A link leads to a knowledge item that does not exist',
      'LINK_TARGET_NOT_FOUND',
    );
  }
}
