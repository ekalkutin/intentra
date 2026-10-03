import { baseApi, sessionTokens } from '@/shared/api';
import type {
  EditMeDto,
  MeDto,
  RegisterAccountDto,
  SignInDto,
  TokenPair,
} from '@intentra/contracts/iam';

/** Signing up and in, and who is signed in (`/api/iam`). */
export const sessionApi = baseApi.injectEndpoints({
  endpoints: build => ({
    signUp: build.mutation<void, RegisterAccountDto>({
      query: body => ({ url: '/iam/auth/sign-up', method: 'POST', body }),
    }),
    signIn: build.mutation<TokenPair, SignInDto>({
      query: body => ({ url: '/iam/auth/sign-in', method: 'POST', body }),
      async onQueryStarted(_, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        sessionTokens.set(data);
      },
    }),
    me: build.query<MeDto, void>({
      query: () => '/iam/me',
    }),
    editMe: build.mutation<MeDto, EditMeDto>({
      query: body => ({ url: '/iam/me', method: 'PATCH', body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(sessionApi.util.upsertQueryData('me', undefined, data));
      },
    }),
  }),
});

export const {
  useSignUpMutation,
  useSignInMutation,
  useMeQuery,
  useEditMeMutation,
} = sessionApi;
