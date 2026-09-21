import { EntityId } from './entity-id.vo.js';

/**
 * Граница тенанта. PRD §10: каждый объект принадлежит ровно одному Workspace,
 * и project-scoped данные не ссылаются на сущности другого.
 */
export class WorkspaceId extends EntityId {
  declare private readonly __type: 'WorkspaceId';
}
