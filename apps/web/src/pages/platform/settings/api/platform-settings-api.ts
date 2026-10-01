import { API_TAGS, baseApi } from '@/shared/api';
import type { OpenSignUpDto } from '@intentra/contracts/iam';
import type { OpenWorkspaceCreationDto } from '@intentra/contracts/workspace';

const SIGN_UP = '/platform/sign-up';
const WORKSPACE_CREATION = '/platform/workspace-creation';

/** Who may join the platform and who may start a Workspace on it; a Platform Admin's settings. */
export const platformSettingsApi = baseApi.injectEndpoints({
  endpoints: build => ({
    openSignUp: build.query<OpenSignUpDto, void>({
      query: () => SIGN_UP,
      providesTags: [API_TAGS.platformSettings],
    }),
    setOpenSignUp: build.mutation<OpenSignUpDto, OpenSignUpDto>({
      query: body => ({ url: SIGN_UP, method: 'PUT', body }),
      invalidatesTags: [API_TAGS.platformSettings],
    }),
    openWorkspaceCreation: build.query<OpenWorkspaceCreationDto, void>({
      query: () => WORKSPACE_CREATION,
      providesTags: [API_TAGS.platformSettings],
    }),
    setOpenWorkspaceCreation: build.mutation<
      OpenWorkspaceCreationDto,
      OpenWorkspaceCreationDto
    >({
      query: body => ({ url: WORKSPACE_CREATION, method: 'PUT', body }),
      invalidatesTags: [API_TAGS.platformSettings],
    }),
  }),
});

export const {
  useOpenSignUpQuery,
  useSetOpenSignUpMutation,
  useOpenWorkspaceCreationQuery,
  useSetOpenWorkspaceCreationMutation,
} = platformSettingsApi;
