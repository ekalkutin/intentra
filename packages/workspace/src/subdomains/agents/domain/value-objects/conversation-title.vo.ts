import { InvalidConversationTitleException } from '../exceptions/index.js';

const MAX_LENGTH = 200;
const ELLIPSIS = '…';
/** Markdown a model may wrap a suggested title in: emphasis, headings, quotes, code. */
const MARKUP = /[*_`#>]+/g;

export class ConversationTitle {
  readonly #value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidConversationTitleException();
    }
    this.#value = trimmed;
  }

  /**
   * A title Intentra suggested, which a model wrote and nobody checked: its
   * first line without markup, cut to the limit; none when nothing is left.
   * Stored suggestions go through it too, so no title can break a list.
   */
  public static fromSuggestion(text: string): ConversationTitle | null {
    const line =
      text
        .split('\n')
        .map(part => part.replace(MARKUP, '').replace(/\s+/g, ' ').trim())
        .find(part => part.length > 0) ?? '';
    if (line.length === 0) {
      return null;
    }

    return new ConversationTitle(
      line.length > MAX_LENGTH
        ? `${line.slice(0, MAX_LENGTH - ELLIPSIS.length).trimEnd()}${ELLIPSIS}`
        : line,
    );
  }

  public get value(): string {
    return this.#value;
  }
}
