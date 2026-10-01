import type { PassportChapter } from './chapters';

/** How many of a chapter's items a prompt names; the agent reads the rest itself. */
export const ITEMS_NAMED = 12;

/**
 * What a chapter already holds, for a prompt: its first items as
 * `KEY «title»`, in reading order, and how many more it has.
 */
export function chapterItems(chapter: PassportChapter): {
  readonly named: readonly string[];
  readonly rest: number;
} {
  const named = chapter.groups
    .flatMap(group => group.items)
    .slice(0, ITEMS_NAMED)
    .map(item => `${item.key} «${item.title}»`);

  return { named, rest: Math.max(0, chapter.count - named.length) };
}
