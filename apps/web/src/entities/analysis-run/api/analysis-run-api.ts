import { API_TAGS, baseApi } from '@/shared/api';
import type {
  AnalysisRunDto,
  AnalysisRunPageDto,
  ListAnalysisRunsDto,
} from '@intentra/contracts/workspace';

type InProject = {
  readonly workspaceId: string;
  readonly projectId: string;
};

function runsPath({ workspaceId, projectId }: InProject): string {
  return `/workspaces/${workspaceId}/projects/${projectId}/analysis-runs`;
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
    startAnalysisRun: build.mutation<AnalysisRunDto, InProject>({
      query: scope => ({ url: runsPath(scope), method: 'POST' }),
      invalidatesTags: [API_TAGS.analysisRun],
    }),
  }),
});

export const { useAnalysisRunsQuery, useStartAnalysisRunMutation } =
  analysisRunApi;
