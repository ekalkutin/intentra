import { API_URL } from '@/shared/api/api-url';

import { notifySessionExpired } from './session-expiry';
import {
  clearTokens,
  readRefreshToken,
  storeTokens,
  type Tokens,
} from './tokens';

async function requestTokens(): Promise<Tokens> {
  const refreshToken = readRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token to spend');
  }

  const response = await fetch(`${API_URL}/iam/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Token refresh refused');
  }

  return (await response.json()) as Tokens;
}

let inFlight: Promise<boolean> | null = null;

/**
 * Меняет refresh-токен на новую пару — один раз для всех, кто ждёт.
 *
 * Несколько запросов истекают в один момент и все получают отказ разом. Второе
 * продление тратило бы токен, который первое уже заменило, поэтому все
 * желающие делят один запрос в полёте. Обычный `fetch`, не RTK Query: чинить
 * запрос тем же механизмом, который сломался, значит войти в рекурсию.
 */
export const refreshSession = (): Promise<boolean> => {
  inFlight ??= requestTokens()
    .then(tokens => {
      storeTokens(tokens);

      return true;
    })
    .catch(() => {
      clearTokens();
      notifySessionExpired();

      return false;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};
