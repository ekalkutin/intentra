import {
  KnowledgeLinkTypeDtoSchema,
  type KnowledgeItemDto,
  type KnowledgeLinkTypeDto,
} from '@intentra/contracts/workspace';

/** Why a chosen Draft cannot go: the person may not approve it, it is under review, or it rests on a Draft that cannot go. */
export const BULK_APPROVAL_BLOCKS = {
  forbidden: 'forbidden',
  needsReview: 'needs-review',
  dependsOnBlocked: 'depends-on-blocked',
} as const;

const ALONG: readonly KnowledgeLinkTypeDto[] = [
  KnowledgeLinkTypeDtoSchema.enum['depends-on'],
  KnowledgeLinkTypeDtoSchema.enum.answers,
];

export type BulkApprovalBlock =
  (typeof BULK_APPROVAL_BLOCKS)[keyof typeof BULK_APPROVAL_BLOCKS];

export type BulkApproval = {
  /** The Drafts approved together, each with the version read: the chosen ones first, then the Drafts they depend on. */
  readonly items: { readonly key: string; readonly version: number }[];
  /** The same Drafts, to show what is approved. */
  readonly approved: KnowledgeItemDto[];
  /** How many of them were not chosen but come along as dependencies. */
  readonly dependencies: number;
  /** The chosen Drafts left out, each with why; `on` names the Draft that blocks it. */
  readonly blocked: {
    readonly item: KnowledgeItemDto;
    readonly reason: BulkApprovalBlock;
    readonly on: string | null;
  }[];
};

/**
 * What approving the chosen Drafts at once takes: each with every Draft it
 * depends on, at any depth, and every Draft Open Question it answers, in one all-or-nothing step. A Draft the person
 * may not approve or one marked Needs Review is left out, and so is every
 * chosen Draft resting on one. `drafts` holds the Project's Drafts; a target
 * not among them is taken as Approved, since anything else would have marked
 * its source Needs Review. The server checks the same again.
 */
export function planBulkApproval(
  chosen: readonly KnowledgeItemDto[],
  drafts: readonly KnowledgeItemDto[],
): BulkApproval {
  const byKey = new Map(drafts.map(item => [item.key, item]));
  // What a Draft takes along: the Drafts it depends on and the Draft Open Questions it answers.
  const dependsOn = (item: KnowledgeItemDto) =>
    item.links
      .filter(link => ALONG.includes(link.type))
      .map(link => byKey.get(link.key))
      .filter(target => target !== undefined);

  const verdicts = new Map<string, BulkApproval['blocked'][number] | null>();
  const blockOf = (
    item: KnowledgeItemDto,
  ): BulkApproval['blocked'][number] | null => {
    if (verdicts.has(item.key)) return verdicts.get(item.key) ?? null;
    // A cycle comes back here: it blocks nothing by itself.
    verdicts.set(item.key, null);
    let verdict: BulkApproval['blocked'][number] | null = null;
    if (!item.access.canApprove) {
      verdict = { item, reason: BULK_APPROVAL_BLOCKS.forbidden, on: null };
    } else if (item.needsReview) {
      verdict = { item, reason: BULK_APPROVAL_BLOCKS.needsReview, on: null };
    } else {
      const blocker = dependsOn(item).find(target => blockOf(target) !== null);
      if (blocker) {
        verdict = {
          item,
          reason: BULK_APPROVAL_BLOCKS.dependsOnBlocked,
          on: blocker.key,
        };
      }
    }
    verdicts.set(item.key, verdict);

    return verdict;
  };

  const approved: KnowledgeItemDto[] = [];
  const blocked: BulkApproval['blocked'] = [];
  const add = (item: KnowledgeItemDto) => {
    if (approved.includes(item)) return;
    approved.push(item);
    dependsOn(item).forEach(add);
  };
  for (const item of chosen) {
    const block = blockOf(item);
    if (block) {
      blocked.push(block);
    }
  }
  for (const item of chosen.filter(item => blockOf(item) === null)) {
    add(item);
  }
  const chosenKeys = new Set(chosen.map(item => item.key));

  return {
    items: approved.map(({ key, version }) => ({ key, version })),
    approved,
    dependencies: approved.filter(item => !chosenKeys.has(item.key)).length,
    blocked,
  };
}
