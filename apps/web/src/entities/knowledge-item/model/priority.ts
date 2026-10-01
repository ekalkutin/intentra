import {
  KnowledgeKindDtoSchema,
  RequirementPriorityDtoSchema,
  type KnowledgeKindDto,
  type RequirementPriorityDto,
} from '@intentra/contracts/workspace';

/** The field of a Requirement that holds its priority. */
const PRIORITY_FIELD = 'priority';

/** How many of the three bars a priority fills: the more, the more it matters. */
export const PRIORITY_LEVELS: Readonly<Record<RequirementPriorityDto, number>> =
  {
    must: 3,
    should: 2,
    could: 1,
  };

/** The priority a Kind's choice holds, when the choice is a Requirement's priority. */
export function priorityOf(
  kind: KnowledgeKindDto,
  field: string,
  value: string,
): RequirementPriorityDto | null {
  if (
    kind !== KnowledgeKindDtoSchema.enum.requirement ||
    field !== PRIORITY_FIELD
  ) {
    return null;
  }
  const parsed = RequirementPriorityDtoSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
