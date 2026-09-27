import { EntityId } from './entity-id.vo.js';

/** Identity of an Account in IAM; other contexts refer to people by it. */
export class AccountId extends EntityId {
  declare private readonly __type: 'AccountId';
}
