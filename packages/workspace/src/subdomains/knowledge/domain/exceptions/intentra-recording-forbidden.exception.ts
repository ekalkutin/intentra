import { ForbiddenException } from '@intentra/shared-kernel';

export class IntentraRecordingForbiddenException extends ForbiddenException<'INTENTRA_RECORDING_FORBIDDEN'> {
  constructor() {
    super(
      'Intentra itself records only new Open Questions, never another Kind or a replacement',
      'INTENTRA_RECORDING_FORBIDDEN',
    );
  }
}
