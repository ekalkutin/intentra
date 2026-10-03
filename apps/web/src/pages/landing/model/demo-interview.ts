/** Fictional products the sample interview can be about. Copy lives in the landing locale. */
export const DEMO_CASES = ['orbit', 'kettle', 'ledger'] as const;

export type DemoCase = (typeof DEMO_CASES)[number];

/** The products' names: proper nouns, the same in every language. */
export const DEMO_CASE_NAMES = {
  orbit: 'Orbit',
  kettle: 'Kettle',
  ledger: 'Ledger',
} as const satisfies Record<DemoCase, string>;

/** Every case is asked the same three kinds of question, in this order. */
export const DEMO_TURNS = [
  { key: 'rule', kind: 'business-rule', prefix: 'BR', first: 12 },
  { key: 'flow', kind: 'scenario', prefix: 'SC', first: 8 },
  { key: 'need', kind: 'requirement', prefix: 'REQ', first: 24 },
] as const;

/** What Intentra records when an answer leaves something open. */
export const DEMO_ISSUE = {
  kind: 'open-question',
  prefix: 'OQ',
  first: 5,
} as const;

/** The answers offered for every question; the visitor picks one. */
export const DEMO_OPTIONS = ['a', 'b'] as const;

export type DemoOption = (typeof DEMO_OPTIONS)[number];

/** How long each beat of the conversation takes, in milliseconds. */
export const DEMO_PACE = {
  /** After a person's message, before Intentra reacts. */
  sent: 600,
  /** Intentra thinking before a question. */
  think: 1500,
  /** Intentra writing a Draft down. */
  record: 800,
  /** Intentra checking the answer against what is already recorded. */
  check: 1300,
  /** Between a streamed message's end and the next beat. */
  settle: 400,
  /** Characters revealed per tick while a message streams in. */
  streamChars: 3,
  streamTick: 22,
} as const;

/** A random element other than the current one, so a restart shows something new. */
export function another<T>(
  items: readonly T[],
  current: T | null,
  random: () => number = Math.random,
): T {
  const others = items.length > 1 ? items.filter(i => i !== current) : items;
  return others[Math.floor(random() * others.length)]!;
}
