import { canBePart, featureOf } from '@/entities/knowledge-item';
import {
  KnowledgeStatusDtoSchema,
  type KnowledgeItemDto,
} from '@intentra/contracts/workspace';

const { draft, approved } = KnowledgeStatusDtoSchema.enum;

/** Why an item cannot be put into the Feature on the page right now. */
export const PART_BLOCKS = {
  /** An Approved item goes only into an Approved Feature. */
  featureNotApproved: 'featureNotApproved',
} as const;

export type PartBlock = (typeof PART_BLOCKS)[keyof typeof PART_BLOCKS];

/** An item that could go into the Feature, and whether it can now. */
export type PartCandidate = {
  readonly item: KnowledgeItemDto;
  /** The Feature it is part of now, which it would leave. */
  readonly from: string | null;
  readonly block: PartBlock | null;
};

/**
 * Whether the Member may move this item in or out of a Feature, by the
 * server's verdict: a Draft by editing its Links, an Approved item by
 * Feature Assignment.
 */
export function canMovePart(item: KnowledgeItemDto): boolean {
  if (item.status === draft) {
    return item.access.canEdit;
  }

  return item.status === approved && item.access.canAssignToFeature;
}

/**
 * The current Scenarios, Requirements and Business Rules the Member may put
 * into the Feature, those of other Features included (they would move); an
 * Approved one waits while the Feature is a Draft.
 */
export function partCandidates(
  feature: KnowledgeItemDto,
  items: readonly KnowledgeItemDto[],
): PartCandidate[] {
  return items
    .filter(
      item =>
        canBePart(item.kind) &&
        featureOf(item) !== feature.key &&
        canMovePart(item),
    )
    .map(item => ({
      item,
      from: featureOf(item),
      block:
        item.status === approved && feature.status !== approved
          ? PART_BLOCKS.featureNotApproved
          : null,
    }));
}

/** What putting items into a Feature, or out of it, takes: one assignment for the Approved ones, an edit for each Draft. */
export function planPartChange(items: readonly KnowledgeItemDto[]): {
  readonly assigned: readonly KnowledgeItemDto[];
  readonly edited: readonly KnowledgeItemDto[];
} {
  return {
    assigned: items.filter(item => item.status === approved),
    edited: items.filter(item => item.status === draft),
  };
}
