import { EntityId } from './entity-id.vo.js';

/**
 * Tenant boundary: every object belongs to exactly one Workspace, and data of
 * one workspace never references entities of another one.
 */
export class WorkspaceId extends EntityId {
  declare private readonly __type: 'WorkspaceId';
}
