/**
 * Parts of a Markdown text where a reference must stay text: fenced and
 * inline code, links and images (`[text](url)`), autolinks (`<url>`) and
 * bare URLs; turning a word inside them into a link would break them.
 */
const PROTECTED =
  /(```[\s\S]*?```|`[^`\n]*`|!?\[[^\]\n]*\]\([^)\n]*\)|<[a-z][a-z0-9+.-]*:[^>\s]*>|https?:\/\/[^\s)]+)/gi;

/**
 * Makes each match of `pattern` in a Markdown text a Markdown link to
 * `toHref(match)`, leaving code, links and URLs as they are.
 */
export function linkReferences(
  text: string,
  pattern: RegExp,
  toHref: (match: string) => string,
): string {
  const everywhere = new RegExp(
    pattern.source,
    pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`,
  );

  return text
    .split(PROTECTED)
    .map((part, index) =>
      // `split` with one capture group puts the protected parts at odd places.
      index % 2 === 1
        ? part
        : part.replace(everywhere, match => `[${match}](${toHref(match)})`),
    )
    .join('');
}
