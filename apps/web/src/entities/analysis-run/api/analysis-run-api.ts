import { API_TAGS, baseApi } from '@/shared/api';
import type {
  AnalysisRunDto,
  AnalysisRunPageDto,
  AnalysisScheduleDto,
  ChangeAnalysisScheduleDto,
  ListAnalysisRunsDto,
  StartAnalysisRunDto,
} from '@intentra/contracts/workspace';

type InProject = {
  readonly workspaceId: string;
  readonly projectId: string;
};

function runsPath({ workspaceId, projectId }: InProject): string {
  return `/workspaces/${workspaceId}/projects/${projectId}/analysis-runs`;
}

function schedulePath({ workspaceId, projectId }: InProject): string {
  return `/workspaces/${workspaceId}/projects/${projectId}/analysis-schedule`;
}

/** A Project's Analysis Runs (`/api/workspaces/:id/projects/:id/analysis-runs`). */
export const analysisRunApi = baseApi.injectEndpoints({
  endpoints: build => ({
    analysisRuns: build.query<
      AnalysisRunPageDto,
      InProject & { readonly page: Partial<ListAnalysisRunsDto> }
    >({
      query: ({ page, ...scope }) => {
        const params = new URLSearchParams();
        if (page.take !== undefined) params.set('take', String(page.take));
        if (page.offset !== undefined) {
          params.set('offset', String(page.offset));
        }
        const search = params.toString();

        return `${runsPath(scope)}${search ? `?${search}` : ''}`;
      },
      providesTags: [API_TAGS.analysisRun],
    }),
    startAnalysisRun: build.mutation<
      AnalysisRunDto,
      InProject & { readonly body: StartAnalysisRunDto }
    >({
      query: ({ body, ...scope }) => ({
        url: runsPath(scope),
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.analysisRun],
    }),
    // What blocks it follows the Provider Key and the Published Agents.
    analysisSchedule: build.query<AnalysisScheduleDto, InProject>({
      query: scope => schedulePath(scope),
      providesTags: [
        API_TAGS.analysisSchedule,
        API_TAGS.providerKey,
        API_TAGS.platformAgents,
      ],
    }),
    changeAnalysisSchedule: build.mutation<
      AnalysisScheduleDto,
      InProject & { readonly body: ChangeAnalysisScheduleDto }
    >({
      query: ({ body, ...scope }) => ({
        url: schedulePath(scope),
        method: 'PUT',
        body,
      }),
      // Optimistic: the switch turns at once; the answer settles it, a failure undoes it and reads it again.
      async onQueryStarted(
        { body, workspaceId, projectId },
        { dispatch, queryFulfilled },
      ) {
        const scope = { workspaceId, projectId };
        const patch = dispatch(
          analysisRunApi.util.updateQueryData(
            'analysisSchedule',
            scope,
            draft => ({ ...draft, enabled: body.enabled }),
          ),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            analysisRunApi.util.upsertQueryData(
              'analysisSchedule',
              scope,
              data,
            ),
          );
        } catch {
          patch.undo();
          dispatch(
            analysisRunApi.util.invalidateTags([API_TAGS.analysisSchedule]),
          );
        }
      },
    }),
  }),
});

export const {
  useAnalysisRunsQuery,
  useStartAnalysisRunMutation,
  useAnalysisScheduleQuery,
  useChangeAnalysisScheduleMutation,
} = analysisRunApi;
