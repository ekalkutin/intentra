import {
  KnowledgeStatusDtoSchema,
  type KnowledgeDependenciesDto,
  type KnowledgeDependencyDto,
} from '@intentra/contracts/workspace';

/** Why an item in the cascade stops a Draft from being approved. */
export const APPROVAL_BLOCKS = {
  forbidden: 'forbidden',
  needsReview: 'needs-review',
  rejected: 'rejected',
  obsolete: 'obsolete',
} as const;

export type ApprovalBlock =
  (typeof APPROVAL_BLOCKS)[keyof typeof APPROVAL_BLOCKS];

export type Approval = {
  /** The Drafts approved together, the item itself first, each with the version read. */
  readonly items: { readonly key: string; readonly version: number }[];
  /**
   * What stands in the way, such as a Draft it depends on that the person may
   * not approve, or one that is marked Needs Review; empty when it can go.
   */
  readonly blockers: KnowledgeDependencyDto[];
};

const { draft, rejected, obsolete } = KnowledgeStatusDtoSchema.enum;

/**
 * Why an item stops the cascade it is in, or null when it does not: a Draft
 * the person may not approve or one marked Needs Review, and a Rejected or
 * Obsolete item.
 */
export function approvalBlockOf(
  item: Pick<KnowledgeDependencyDto, 'status' | 'needsReview' | 'access'>,
): ApprovalBlock | null {
  if (item.status === rejected) {
    return APPROVAL_BLOCKS.rejected;
  }
  if (item.status === obsolete) {
    return APPROVAL_BLOCKS.obsolete;
  }
  if (item.status !== draft) {
    return null;
  }
  if (!item.access.canApprove) {
    return APPROVAL_BLOCKS.forbidden;
  }

  return item.needsReview ? APPROVAL_BLOCKS.needsReview : null;
}

/**
 * What approving a Draft takes: the Draft and every Draft it depends on, at
 * any depth, approved in one step, unless something in the cascade blocks it
 * (see `approvalBlockOf`); the server checks the same again.
 */
export function planApproval(dependencies: KnowledgeDependenciesDto): Approval {
  const drafts = dependencies.items.filter(item => item.status === draft);
  const blockers = dependencies.items.filter(
    item => approvalBlockOf(item) !== null,
  );

  return {
    items: drafts.map(({ key, version }) => ({ key, version })),
    blockers,
  };
}
