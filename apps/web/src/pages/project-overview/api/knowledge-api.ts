import { API_TAGS, baseApi } from '@/shared/api';
import type {
  KnowledgeItemPageDto,
  ListKnowledgeItemsDto,
} from '@intentra/contracts/workspace';

type KnowledgeQuery = {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly filter: Partial<ListKnowledgeItemsDto>;
};

function toSearch(filter: Partial<ListKnowledgeItemsDto>): string {
  const params = new URLSearchParams();
  if (filter.kind) {
    params.set('kind', filter.kind);
  }
  if (filter.statuses) {
    params.set('statuses', filter.statuses.join(','));
  }
  if (filter.needsReview !== undefined) {
    params.set('needsReview', String(filter.needsReview));
  }
  if (filter.take !== undefined) {
    params.set('take', String(filter.take));
  }
  if (filter.offset !== undefined) {
    params.set('offset', String(filter.offset));
  }
  const search = params.toString();

  return search ? `?${search}` : '';
}

/** A Project's Knowledge Items (`/api/workspaces/:id/projects/:id/knowledge`). */
export const knowledgeApi = baseApi.injectEndpoints({
  endpoints: build => ({
    knowledgeItems: build.query<KnowledgeItemPageDto, KnowledgeQuery>({
      query: ({ workspaceId, projectId, filter }) =>
        `/workspaces/${workspaceId}/projects/${projectId}/knowledge${toSearch(filter)}`,
      providesTags: [API_TAGS.knowledge],
    }),
  }),
});

export const { useKnowledgeItemsQuery } = knowledgeApi;
