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

/** An ISO 8601 date in a few characters, such as `12 сент.`; the year only when it is not this one. */
export function useFormatShortDate(): (iso: string) => string {
  const { i18n } = useTranslation();

  return useCallback(
    iso => {
      const date = new Date(iso);
      return new Intl.DateTimeFormat(i18n.language, {
        day: 'numeric',
        month: 'short',
        year:
          date.getFullYear() === new Date().getFullYear()
            ? undefined
            : 'numeric',
      }).format(date);
    },
    [i18n.language],
  );
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
/** Up to this age a moment reads as "N days ago"; older ones as a date. */
const RELATIVE_DAYS = 7;

/**
 * How long ago a moment was, the way people say it: `5 минут назад`,
 * `вчера`; a week or more ago, the short date (`12 сент.`).
 */
export function useFormatWhen(): (iso: string) => string {
  const { i18n } = useTranslation();
  const shortDate = useFormatShortDate();

  return useCallback(
    iso => {
      const age = Date.now() - new Date(iso).getTime();
      const relative = new Intl.RelativeTimeFormat(i18n.language, {
        numeric: 'auto',
      });
      if (age < MINUTE) {
        return relative.format(0, 'second');
      }
      if (age < HOUR) {
        return relative.format(-Math.floor(age / MINUTE), 'minute');
      }
      if (age < DAY) {
        return relative.format(-Math.floor(age / HOUR), 'hour');
      }
      if (age < RELATIVE_DAYS * DAY) {
        return relative.format(-Math.floor(age / DAY), 'day');
      }
      return shortDate(iso);
    },
    [i18n.language, shortDate],
  );
}

/** An ISO 8601 moment in full, such as `1 окт. 2026 г., 14:20`, for tooltips. */
export function useFormatMoment(): (iso: string) => string {
  const { i18n } = useTranslation();

  return useCallback(
    iso =>
      new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(iso)),
    [i18n.language],
  );
}
