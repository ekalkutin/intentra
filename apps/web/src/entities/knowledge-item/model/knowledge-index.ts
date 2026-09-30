import { useMemo } from 'react';

import {
  KnowledgeStatusDtoSchema,
  type KnowledgeItemDto,
} from '@intentra/contracts/workspace';

import { useKnowledgeItemsQuery, type InProject } from '../api/knowledge-api';

import { KNOWLEDGE_LIST_SIZE } from './list-view';

export type KnowledgeIndex = {
  /** Every item of the Project in any status, up to the list's limit. */
  readonly items: KnowledgeItemDto[];
  readonly byKey: ReadonlyMap<string, KnowledgeItemDto>;
};

/**
 * A Project's items in every status, to name the targets of Links by their
 * titles, find what links to an item, and offer targets for new Links.
 */
export function useKnowledgeIndex(
  scope: InProject,
  { skip }: { readonly skip: boolean },
): KnowledgeIndex {
  const { data } = useKnowledgeItemsQuery(
    {
      ...scope,
      filter: {
        statuses: [...KnowledgeStatusDtoSchema.options],
        take: KNOWLEDGE_LIST_SIZE,
      },
    },
    { skip },
  );

  return useMemo(() => {
    const items = data?.items ?? [];
    return { items, byKey: new Map(items.map(item => [item.key, item])) };
  }, [data]);
}
