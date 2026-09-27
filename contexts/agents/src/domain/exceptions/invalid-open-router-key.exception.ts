import { DomainException } from '@intentra/shared';

export class InvalidOpenRouterKeyException extends DomainException<'INVALID_OPEN_ROUTER_KEY'> {
  constructor(message: string) {
    super(message, 'INVALID_OPEN_ROUTER_KEY');
  }
}
