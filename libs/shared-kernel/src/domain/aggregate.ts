import { EntityId } from './value-objects/entity-id.vo.js';

export abstract class Aggregate<TEntityId extends EntityId = EntityId> {
  constructor(public readonly id: TEntityId) {}
}
