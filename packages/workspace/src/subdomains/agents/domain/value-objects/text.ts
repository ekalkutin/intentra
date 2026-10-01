/** The text without surrounding whitespace, or null when it is empty or longer than `max`. */
export function trimmedWithin(value: string, max: number): string | null {
  const trimmed = value.trim();

  return trimmed.length > 0 && trimmed.length <= max ? trimmed : null;
}
