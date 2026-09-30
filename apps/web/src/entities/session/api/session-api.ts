import { baseApi, sessionTokens } from '@/shared/api';
import type {
  Actor,
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
    me: build.query<Actor, void>({
      query: () => '/iam/me',
    }),
  }),
});

export const { useSignUpMutation, useSignInMutation, useMeQuery } = sessionApi;
