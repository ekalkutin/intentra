import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

/** Что сервер прислал вместе с отказом. Nest кладёт текст в `message`. */
type ServerRefusal = {
  message?: string | string[];
  error?: string;
};

function isFetchError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

/**
 * Превращает отказ в одну фразу для человека.
 *
 * Текст берётся с сервера, а не сочиняется здесь: сообщения живут в схемах
 * контракта вместе с правилами, и повторять их в браузере значило бы однажды
 * разойтись. Свой текст остаётся только там, где сервер не сказал ничего —
 * запрос не дошёл.
 */
export function describeAuthError(
  error: unknown,
  fallback: string,
): string | null {
  if (error === undefined || error === null) {
    return null;
  }

  if (!isFetchError(error) || error.status === 'FETCH_ERROR') {
    return fallback;
  }

  const message = (error.data as ServerRefusal | undefined)?.message;

  if (Array.isArray(message)) {
    return message.join('. ');
  }

  return message ?? fallback;
}
