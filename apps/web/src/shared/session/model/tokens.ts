import { resetSessionExpired } from './session-expiry';

const ACCESS_TOKEN_KEY = 'intentra.access_token';
const REFRESH_TOKEN_KEY = 'intentra.refresh_token';

export type Tokens = Readonly<{
  access_token: string;
  refresh_token: string;
}>;

/**
 * Единственное место, которое знает, где лежит сессия. Запрос, формы входа и
 * охранник маршрута читают только через него, поэтому ключи не могут разъехаться.
 */
export const readAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const readRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

/**
 * Есть ли с чем входить.
 *
 * Отсутствие access-токена — ещё не отсутствие сессии: refresh живёт неделю
 * против его часа, и запрос меняет один на другой при первом отказе. Поэтому
 * считается любой из двух.
 */
export const hasStoredSession = (): boolean =>
  readAccessToken() !== null || readRefreshToken() !== null;

export const storeTokens = (tokens: Tokens): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  resetSessionExpired();
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
