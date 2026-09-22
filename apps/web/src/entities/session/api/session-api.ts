import { api } from '@/shared/api';
import { hasStoredSession } from '@/shared/session';

export type CurrentAccount = {
  accountId: string;
  email: string;
};

export const sessionApi = api.injectEndpoints({
  endpoints: builder => ({
    /** Кто предъявил токен. Отвечает сервер, а не разбор токена в браузере. */
    me: builder.query<CurrentAccount, void>({
      query: () => 'iam/auth/me',
      providesTags: ['Session'],
    }),
  }),
});

const { useMeQuery: useMeQueryRaw } = sessionApi;

/**
 * Текущий аккаунт — только когда есть чем спрашивать.
 *
 * Пропуск при отсутствии сессии важен не для экономии: сразу после выхода
 * компонент ещё смонтирован, и запрос без токена получил бы отказ, а тот
 * запустил бы продление и объявил сессию истёкшей — для выхода, который
 * человек сделал сам.
 */
export const useMeQuery = () =>
  useMeQueryRaw(undefined, { skip: !hasStoredSession() });
