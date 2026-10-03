import {
  useAssignToFeatureMutation,
  useEditKnowledgeItemMutation,
  withFeature,
  type InProject,
} from '@/entities/knowledge-item';
import { toApiError, type ApiError } from '@/shared/api';
import type {
  EditKnowledgeItemDto,
  KnowledgeItemDto,
} from '@intentra/contracts/workspace';

import { planPartChange } from './feature-parts';

/**
 * Puts items into a Feature, or takes them out of theirs (`null`): the
 * Approved ones in one Feature Assignment, keeping their Knowledge Keys,
 * then each Draft by editing its Links. Resolves with the first failure, or
 * null once everything moved.
 */
export function useMoveParts(
  scope: InProject,
): readonly [
  (
    items: readonly KnowledgeItemDto[],
    featureKey: string | null,
  ) => Promise<ApiError | null>,
  boolean,
] {
  const [assign, assigning] = useAssignToFeatureMutation();
  const [edit, editing] = useEditKnowledgeItemMutation();

  const move = async (
    items: readonly KnowledgeItemDto[],
    featureKey: string | null,
  ): Promise<ApiError | null> => {
    const { assigned, edited } = planPartChange(items);
    if (assigned.length > 0) {
      const result = await assign({
        ...scope,
        body: {
          feature: featureKey,
          items: assigned.map(({ key, version }) => ({ key, version })),
        },
      });
      const error = toApiError(result.error);
      if (error) {
        return error;
      }
    }
    // One by one: each edit is checked against the version that was seen.
    for (const item of edited) {
      const result = await edit({
        ...scope,
        key: item.key,
        body: {
          kind: item.kind,
          version: item.version,
          links: withFeature(item.links, featureKey),
        } as EditKnowledgeItemDto,
      });
      const error = toApiError(result.error);
      if (error) {
        return error;
      }
    }

    return null;
  };

  return [move, assigning.isLoading || editing.isLoading] as const;
}
