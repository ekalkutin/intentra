import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { readAccessToken, refreshSession } from '@/shared/session';

import { API_URL } from './api-url';

const UNAUTHORIZED = 401;

const request = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: headers => {
    const token = readAccessToken();

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

/**
 * Запрос с токеном сессии, один раз переспрашивающий после отказа.
 *
 * Получив 401, продлевает сессию и повторяет запрос с новым токеном. Второй
 * отказ отдаётся вызывающему как есть: повторять дальше значило бы крутиться в
 * цикле на просроченной сессии, а показать форму входа — дело охранника.
 */
export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, options) => {
  const first = await request(args, api, options);

  if (first.error?.status !== UNAUTHORIZED) {
    return first;
  }

  const refreshed = await refreshSession();

  return refreshed ? request(args, api, options) : first;
};
