import { ConflictException } from '@intentra/shared-kernel';

export class LinkTargetNotCurrentException extends ConflictException<'LINK_TARGET_NOT_CURRENT'> {
  constructor() {
    super(
      'A link cannot lead to a rejected or obsolete item: link to its replacement instead',
      'LINK_TARGET_NOT_CURRENT',
    );
  }
}
