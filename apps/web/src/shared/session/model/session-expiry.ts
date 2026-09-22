import { useSyncExternalStore } from 'react';

let expired = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Мостик из кода вне React в React.
 *
 * Продление сессии падает внутри запроса — там, где нет ни компонента, ни
 * хука, — а решение показать форму входа принимает охранник маршрута. Без
 * такого мостика пришлось бы дёргать `window.location`, то есть перезагружать
 * приложение ради смены экрана.
 */
export function notifySessionExpired(): void {
  if (expired) {
    return;
  }

  expired = true;
  emit();
}

export function resetSessionExpired(): void {
  if (!expired) {
    return;
  }

  expired = false;
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function useSessionExpired(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => expired,
    () => false,
  );
}
