import { API_TAGS, baseApi } from '@/shared/api';
import type {
  CreatedPersonalAccessTokenDto,
  CreatePersonalAccessTokenDto,
  PersonalAccessTokenDto,
  WorkspaceAccessDto,
  WorkspaceDto,
} from '@intentra/contracts/workspace';

type InWorkspace = { readonly workspaceId: string };

/** A token of the signed-in person, with the Workspace it works in. */
export type OwnPersonalAccessToken = {
  readonly workspace: WorkspaceDto;
  readonly token: PersonalAccessTokenDto;
};

/** Personal Access Tokens for external agents (`/api/workspaces/:id/personal-access-tokens`). */
export const personalAccessTokenApi = baseApi.injectEndpoints({
  endpoints: build => ({
    personalAccessTokens: build.query<PersonalAccessTokenDto[], string>({
      query: workspaceId => `/workspaces/${workspaceId}/personal-access-tokens`,
      providesTags: [API_TAGS.personalAccessToken],
    }),
    /**
     * The person's own tokens in every Workspace of theirs. The API lists
     * tokens by Workspace, and shows an Owner everyone's: so each Workspace
     * is asked, and only the tokens of the person's Member there are kept.
     */
    ownPersonalAccessTokens: build.query<
      OwnPersonalAccessToken[],
      readonly WorkspaceDto[]
    >({
      async queryFn(workspaces, _api, _options, baseQuery) {
        const own: OwnPersonalAccessToken[] = [];
        for (const workspace of workspaces) {
          const [access, tokens] = await Promise.all([
            baseQuery(`/workspaces/${workspace.id}/access`),
            baseQuery(`/workspaces/${workspace.id}/personal-access-tokens`),
          ]);
          if (access.error) {
            return { error: access.error };
          }
          if (tokens.error) {
            return { error: tokens.error };
          }
          const { memberId } = access.data as WorkspaceAccessDto;
          for (const token of tokens.data as PersonalAccessTokenDto[]) {
            if (token.memberId === memberId) {
              own.push({ workspace, token });
            }
          }
        }

        return { data: own };
      },
      providesTags: [API_TAGS.personalAccessToken, API_TAGS.workspace],
    }),
    createPersonalAccessToken: build.mutation<
      CreatedPersonalAccessTokenDto,
      InWorkspace & { readonly body: CreatePersonalAccessTokenDto }
    >({
      query: ({ workspaceId, body }) => ({
        url: `/workspaces/${workspaceId}/personal-access-tokens`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.personalAccessToken],
    }),
    revokePersonalAccessToken: build.mutation<
      void,
      InWorkspace & { readonly tokenId: string }
    >({
      query: ({ workspaceId, tokenId }) => ({
        url: `/workspaces/${workspaceId}/personal-access-tokens/${tokenId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.personalAccessToken],
    }),
  }),
});

export const {
  usePersonalAccessTokensQuery,
  useOwnPersonalAccessTokensQuery,
  useCreatePersonalAccessTokenMutation,
  useRevokePersonalAccessTokenMutation,
} = personalAccessTokenApi;
