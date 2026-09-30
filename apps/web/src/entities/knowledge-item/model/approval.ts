import {
  KnowledgeStatusDtoSchema,
  type KnowledgeDependenciesDto,
  type KnowledgeDependencyDto,
} from '@intentra/contracts/workspace';

export type Approval = {
  /** The Drafts approved together, the item itself first, each with the version read. */
  readonly items: { readonly key: string; readonly version: number }[];
  /**
   * What stands in the way, such as a Draft it depends on that the person may
   * not approve, or one that is marked Needs Review; empty when it can go.
   */
  readonly blockers: KnowledgeDependencyDto[];
};

const { draft, approved } = KnowledgeStatusDtoSchema.enum;

/**
 * What approving a Draft takes: the Draft and every Draft it depends on, at
 * any depth, approved in one step. A Draft the person may not approve, one
 * marked Needs Review, and a Rejected or Obsolete item in the cascade block
 * it; the server checks the same again.
 */
export function planApproval(dependencies: KnowledgeDependenciesDto): Approval {
  const drafts = dependencies.items.filter(item => item.status === draft);
  const blockers = dependencies.items.filter(
    item =>
      (item.status === draft &&
        (!item.access.canApprove || item.needsReview)) ||
      (item.status !== draft && item.status !== approved),
  );

  return {
    items: drafts.map(({ key, version }) => ({ key, version })),
    blockers,
  };
}
