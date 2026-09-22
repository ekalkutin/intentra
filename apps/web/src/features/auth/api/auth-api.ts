import { api } from '@/shared/api';
import type { SignInDto, SignUpDto, TokensDto } from '@intentra/iam-contracts';

export const authApi = api.injectEndpoints({
  endpoints: builder => ({
    signUp: builder.mutation<TokensDto, SignUpDto>({
      query: body => ({ url: 'iam/auth/sign-up', method: 'POST', body }),
    }),
    signIn: builder.mutation<TokensDto, SignInDto>({
      query: body => ({ url: 'iam/auth/sign-in', method: 'POST', body }),
    }),
  }),
});

export const { useSignInMutation, useSignUpMutation } = authApi;
