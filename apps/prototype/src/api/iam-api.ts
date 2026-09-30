import { tokensReceived } from '@/features/auth/auth-slice';
import type {
  Actor,
  RegisterAccountDto,
  SignInDto,
  TokenPair,
} from '@intentra/contracts/iam';

import { baseApi } from './base-api';

export const iamApi = baseApi.injectEndpoints({
  endpoints: build => ({
    signUp: build.mutation<void, RegisterAccountDto>({
      query: body => ({ url: '/iam/auth/sign-up', method: 'POST', body }),
    }),
    signIn: build.mutation<TokenPair, SignInDto>({
      query: body => ({ url: '/iam/auth/sign-in', method: 'POST', body }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        dispatch(tokensReceived(data));
      },
    }),
    me: build.query<Actor, void>({
      query: () => '/iam/me',
      providesTags: ['Me'],
    }),
  }),
});

export const { useSignUpMutation, useSignInMutation, useMeQuery } = iamApi;
