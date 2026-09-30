/** How many items one request of the list reads. */
export const PAGE_SIZE = 50;

const seen = new Set<string>();
const pages = new Map<string, number>();

/**
 * What the person has opened of the list in this session (groups that came
 * near the screen, pages loaded), so that coming back draws it again at once,
 * at the same height, and the scroll lands where it was.
 */
export const loadedParts = {
  wasSeen: (part: string): boolean => seen.has(part),
  markSeen: (part: string): void => {
    seen.add(part);
  },
  pages: (part: string): number => pages.get(part) ?? 1,
  setPages: (part: string, count: number): void => {
    pages.set(part, count);
  },
};

/** How many items a page holds: a full page, or what is left of the total. */
export function pageLength(total: number, index: number): number {
  return Math.max(0, Math.min(PAGE_SIZE, total - index * PAGE_SIZE));
}
