import { API_TAGS, baseApi } from '@/shared/api';
import type {
  ApproveKnowledgeItemsDto,
  ConfirmKnowledgeItemDto,
  DeleteKnowledgeItemDto,
  EditKnowledgeItemDto,
  KnowledgeContextDto,
  KnowledgeDependenciesDto,
  KnowledgeFrameDto,
  KnowledgeItemDto,
  KnowledgeItemPageDto,
  KnowledgeSummaryDto,
  ListKnowledgeItemsDto,
  RecordKnowledgeItemDto,
  RejectKnowledgeItemDto,
  RetireKnowledgeItemDto,
} from '@intentra/contracts/workspace';

export type InProject = {
  readonly workspaceId: string;
  readonly projectId: string;
};

type KnowledgeQuery = InProject & {
  readonly filter: Partial<ListKnowledgeItemsDto>;
};

type OneItem = InProject & { readonly key: string };

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
  if (filter.unlinked) {
    params.set('unlinked', 'true');
  }
  if (filter.order) {
    params.set('order', filter.order);
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

function knowledgePath({ workspaceId, projectId }: InProject): string {
  return `/workspaces/${workspaceId}/projects/${projectId}/knowledge`;
}

function itemPath(item: OneItem): string {
  return `${knowledgePath(item)}/${encodeURIComponent(item.key)}`;
}

/**
 * A Project's Knowledge Items (`/api/workspaces/:id/projects/:id/knowledge`).
 * Any change may mark or unmark other items (Needs Review, Supersession), so
 * every change refreshes all of a Project's knowledge.
 */
export const knowledgeApi = baseApi.injectEndpoints({
  endpoints: build => ({
    knowledgeItems: build.query<KnowledgeItemPageDto, KnowledgeQuery>({
      query: ({ filter, ...scope }) =>
        `${knowledgePath(scope)}${toSearch(filter)}`,
      providesTags: [API_TAGS.knowledge],
    }),
    knowledgeSummary: build.query<KnowledgeSummaryDto, InProject>({
      query: scope => `${knowledgePath(scope)}/summary`,
      providesTags: [API_TAGS.knowledge],
    }),
    knowledgeItem: build.query<KnowledgeItemDto, OneItem>({
      query: itemPath,
      providesTags: [API_TAGS.knowledge],
    }),
    knowledgeDependencies: build.query<KnowledgeDependenciesDto, OneItem>({
      query: item => `${itemPath(item)}/dependencies`,
      providesTags: [API_TAGS.knowledge],
    }),
    knowledgeContext: build.query<
      KnowledgeContextDto,
      InProject & { readonly anchors: readonly string[] }
    >({
      query: ({ anchors, ...scope }) =>
        `${knowledgePath(scope)}/context?anchors=${anchors.map(encodeURIComponent).join(',')}`,
      providesTags: [API_TAGS.knowledge],
    }),
    knowledgeFrame: build.query<KnowledgeFrameDto, InProject>({
      query: scope => `${knowledgePath(scope)}/frame`,
      providesTags: [API_TAGS.knowledge],
    }),
    recordKnowledgeItem: build.mutation<
      KnowledgeItemDto,
      InProject & { readonly body: RecordKnowledgeItemDto }
    >({
      query: ({ body, ...scope }) => ({
        url: knowledgePath(scope),
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.knowledge],
    }),
    editKnowledgeItem: build.mutation<
      KnowledgeItemDto,
      OneItem & { readonly body: EditKnowledgeItemDto }
    >({
      query: ({ body, ...item }) => ({
        url: itemPath(item),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [API_TAGS.knowledge],
    }),
    deleteKnowledgeItem: build.mutation<
      void,
      OneItem & { readonly body: DeleteKnowledgeItemDto }
    >({
      query: ({ body, ...item }) => ({
        url: itemPath(item),
        method: 'DELETE',
        body,
      }),
      invalidatesTags: [API_TAGS.knowledge],
    }),
    approveKnowledgeItems: build.mutation<
      KnowledgeItemDto[],
      InProject & { readonly body: ApproveKnowledgeItemsDto }
    >({
      query: ({ body, ...scope }) => ({
        url: `${knowledgePath(scope)}/approve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.knowledge],
    }),
    rejectKnowledgeItem: build.mutation<
      KnowledgeItemDto,
      OneItem & { readonly body: RejectKnowledgeItemDto }
    >({
      query: ({ body, ...item }) => ({
        url: `${itemPath(item)}/reject`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.knowledge],
    }),
    retireKnowledgeItem: build.mutation<
      KnowledgeItemDto,
      OneItem & { readonly body: RetireKnowledgeItemDto }
    >({
      query: ({ body, ...item }) => ({
        url: `${itemPath(item)}/retire`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.knowledge],
    }),
    confirmKnowledgeItem: build.mutation<
      KnowledgeItemDto,
      OneItem & { readonly body: ConfirmKnowledgeItemDto }
    >({
      query: ({ body, ...item }) => ({
        url: `${itemPath(item)}/confirm`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.knowledge],
    }),
  }),
});

export const {
  useKnowledgeItemsQuery,
  useKnowledgeSummaryQuery,
  useKnowledgeItemQuery,
  useKnowledgeDependenciesQuery,
  useKnowledgeContextQuery,
  useKnowledgeFrameQuery,
  useRecordKnowledgeItemMutation,
  useEditKnowledgeItemMutation,
  useDeleteKnowledgeItemMutation,
  useApproveKnowledgeItemsMutation,
  useRejectKnowledgeItemMutation,
  useRetireKnowledgeItemMutation,
  useConfirmKnowledgeItemMutation,
  usePrefetch: useKnowledgePrefetch,
} = knowledgeApi;
