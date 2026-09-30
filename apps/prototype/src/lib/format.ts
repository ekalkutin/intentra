export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX)
    .replace(/-+$/, '');
}

/** Workspace and Project slugs: 3 to 15 lowercase letters, digits or single hyphens. */
export const SLUG_MAX = 15;
export const SLUG_PATTERN = '[a-z0-9]+(-[a-z0-9]+)*';

const dateFormat = new Intl.DateTimeFormat('ru', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatDate(iso: string | null | undefined): string {
  return iso ? dateFormat.format(new Date(iso)) : '—';
}

const relativeFormat = new Intl.RelativeTimeFormat('ru', {
  numeric: 'auto',
});

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—';
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return relativeFormat.format(Math.round(seconds / size), unit);
    }
  }
  return 'только что';
}

export function initials(email: string): string {
  const name = email.split('@')[0] ?? email;
  const parts = name.split(/[._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? name[1] ?? ''))
    .toUpperCase()
    .slice(0, 2);
}
