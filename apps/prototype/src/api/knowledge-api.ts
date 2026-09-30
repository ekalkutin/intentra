import type {
  EditKnowledgeItemDto,
  KnowledgeDependenciesDto,
  KnowledgeItemDto,
  KnowledgeItemPageDto,
  KnowledgeKindDto,
  KnowledgeStatusDto,
  RecordKnowledgeItemDto,
} from '@intentra/contracts/workspace';

import { baseApi } from './base-api';

type InProject = { workspaceId: string; projectId: string };
type ItemRef = InProject & { key: string };
type Versioned = ItemRef & { version: number };

export type KnowledgeListArgs = InProject & {
  kind?: KnowledgeKindDto;
  statuses?: KnowledgeStatusDto[];
  needsReview?: boolean;
  take?: number;
  offset?: number;
};

const base = ({ workspaceId, projectId }: InProject) =>
  `/workspaces/${workspaceId}/projects/${projectId}/knowledge`;

/**
 * Knowledge Items link to and mark each other, so any write may change any
 * item on screen: every write refreshes all Knowledge.
 */
export const knowledgeApi = baseApi.injectEndpoints({
  endpoints: build => ({
    knowledge: build.query<KnowledgeItemPageDto, KnowledgeListArgs>({
      query: ({ workspaceId, projectId, statuses, ...params }) => ({
        url: base({ workspaceId, projectId }),
        params: {
          ...Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined),
          ),
          ...(statuses?.length ? { statuses: statuses.join(',') } : {}),
        },
      }),
      providesTags: ['Knowledge'],
    }),
    knowledgeItem: build.query<KnowledgeItemDto, ItemRef>({
      query: ({ key, ...ref }) => `${base(ref)}/${key}`,
      providesTags: ['Knowledge'],
    }),
    dependencies: build.query<KnowledgeDependenciesDto, ItemRef>({
      query: ({ key, ...ref }) => `${base(ref)}/${key}/dependencies`,
      providesTags: ['Knowledge'],
    }),
    recordKnowledge: build.mutation<
      KnowledgeItemDto,
      InProject & { body: RecordKnowledgeItemDto }
    >({
      query: ({ body, ...ref }) => ({ url: base(ref), method: 'POST', body }),
      invalidatesTags: ['Knowledge'],
    }),
    editKnowledge: build.mutation<
      KnowledgeItemDto,
      ItemRef & { body: EditKnowledgeItemDto }
    >({
      query: ({ key, body, ...ref }) => ({
        url: `${base(ref)}/${key}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Knowledge'],
    }),
    deleteKnowledge: build.mutation<void, Versioned>({
      query: ({ key, version, ...ref }) => ({
        url: `${base(ref)}/${key}`,
        method: 'DELETE',
        body: { version },
      }),
      invalidatesTags: ['Knowledge'],
    }),
    approveKnowledge: build.mutation<
      KnowledgeItemDto[],
      InProject & { items: { key: string; version: number }[] }
    >({
      query: ({ items, ...ref }) => ({
        url: `${base(ref)}/approve`,
        method: 'POST',
        body: { items },
      }),
      invalidatesTags: ['Knowledge'],
    }),
    rejectKnowledge: build.mutation<
      KnowledgeItemDto,
      Versioned & { reason: string | null }
    >({
      query: ({ key, version, reason, ...ref }) => ({
        url: `${base(ref)}/${key}/reject`,
        method: 'POST',
        body: { version, reason },
      }),
      invalidatesTags: ['Knowledge'],
    }),
    retireKnowledge: build.mutation<
      KnowledgeItemDto,
      Versioned & { reason: string | null }
    >({
      query: ({ key, version, reason, ...ref }) => ({
        url: `${base(ref)}/${key}/retire`,
        method: 'POST',
        body: { version, reason },
      }),
      invalidatesTags: ['Knowledge'],
    }),
    confirmKnowledge: build.mutation<KnowledgeItemDto, Versioned>({
      query: ({ key, version, ...ref }) => ({
        url: `${base(ref)}/${key}/confirm`,
        method: 'POST',
        body: { version },
      }),
      invalidatesTags: ['Knowledge'],
    }),
  }),
});

export const {
  useKnowledgeQuery,
  useKnowledgeItemQuery,
  useDependenciesQuery,
  useLazyDependenciesQuery,
  useRecordKnowledgeMutation,
  useEditKnowledgeMutation,
  useDeleteKnowledgeMutation,
  useApproveKnowledgeMutation,
  useRejectKnowledgeMutation,
  useRetireKnowledgeMutation,
  useConfirmKnowledgeMutation,
} = knowledgeApi;
