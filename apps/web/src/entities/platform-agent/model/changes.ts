import type {
  AgentsChangeDto,
  AgentsChangeKindDto,
  AgentsChangesDto,
} from '@intentra/contracts/workspace';

/** How each object differs from the Published Agents, by its id; an object missing here is unchanged. */
export function changeKinds(
  changes: readonly AgentsChangeDto[] | undefined,
): ReadonlyMap<string, AgentsChangeKindDto> {
  return new Map(changes?.map(change => [change.id, change.kind]));
}

/** How many objects publishing would change. */
export function countChanges(changes: AgentsChangesDto | undefined): number {
  return changes
    ? changes.agents.length +
        changes.skills.length +
        changes.modelProfiles.length
    : 0;
}
