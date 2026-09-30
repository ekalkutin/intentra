import { ConflictException } from '@intentra/shared-kernel';

export class LinkTargetNotCurrentException extends ConflictException<'LINK_TARGET_NOT_CURRENT'> {
  /** Given the replacement's Knowledge Key when the target was superseded. */
  constructor(replacementKey: string | null) {
    super(
      replacementKey
        ? `A link cannot lead to an obsolete item: link to its replacement ${replacementKey} instead`
        : 'A link cannot lead to a rejected or obsolete item',
      'LINK_TARGET_NOT_CURRENT',
    );
  }
}
