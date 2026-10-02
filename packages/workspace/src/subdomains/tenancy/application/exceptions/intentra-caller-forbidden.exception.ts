import { ForbiddenException } from '@intentra/shared-kernel';

export class IntentraCallerForbiddenException extends ForbiddenException<'INTENTRA_CALLER_FORBIDDEN'> {
  constructor() {
    super(
      'Intentra itself may only read the knowledge of its Project and record Open Questions',
      'INTENTRA_CALLER_FORBIDDEN',
    );
  }
}
