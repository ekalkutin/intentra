import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/** An ISO 8601 date as the reader's language writes it, such as `30.09.2026`. */
export function useFormatDate(): (iso: string) => string {
  const { i18n } = useTranslation();

  return useCallback(
    iso =>
      new Intl.DateTimeFormat(i18n.language, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(iso)),
    [i18n.language],
  );
}
