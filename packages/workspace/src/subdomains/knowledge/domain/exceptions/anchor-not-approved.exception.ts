import { ConflictException } from '@intentra/shared-kernel';

/** Only Approved knowledge goes to an agent: a Draft is approved first, an Obsolete item has a replacement or none. */
export class AnchorNotApprovedException extends ConflictException<'ANCHOR_NOT_APPROVED'> {
  constructor(key: string, status: string, supersededByKey: string | null) {
    super(
      status === 'draft'
        ? `${key} is a Draft: ask the person to approve it first`
        : supersededByKey
          ? `${key} is ${status}, superseded by ${supersededByKey}: use that one`
          : `${key} is ${status}, no longer part of the Project's knowledge`,
      'ANCHOR_NOT_APPROVED',
    );
  }
}
