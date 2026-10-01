/** When a Conversation was last active: the time today, the date before. */
export function whenActive(
  iso: string,
  language: string,
  now = new Date(),
): string {
  const date = new Date(iso);
  const today =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  return new Intl.DateTimeFormat(
    language,
    today
      ? { hour: '2-digit', minute: '2-digit' }
      : {
          day: 'numeric',
          month: 'short',
          ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
        },
  ).format(date);
}
