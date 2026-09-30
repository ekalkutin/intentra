import type { KnowledgeKindDto } from '@intentra/contracts/workspace';

/** Each Kind's Knowledge Key prefix, as the server numbers them (`REQ-12`). */
export const KIND_KEY_PREFIXES = {
  'product-overview': 'PO',
  goal: 'GOAL',
  persona: 'PER',
  scenario: 'SC',
  requirement: 'REQ',
  constraint: 'CON',
  term: 'TERM',
  'business-rule': 'BR',
  integration: 'INT',
  decision: 'DEC',
  'open-question': 'TBD',
} as const satisfies Record<KnowledgeKindDto, string>;

/**
 * A Knowledge Key inside free text, such as "см. REQ-12": only the known
 * prefixes, so that "UTF-8" or "ISO-9001" stay text.
 */
export const KNOWLEDGE_KEY_PATTERN = new RegExp(
  `\\b(?:${Object.values(KIND_KEY_PREFIXES).join('|')})-\\d+\\b`,
  'g',
);

/** The Kind a Knowledge Key belongs to, read from its prefix. */
export function kindOfKey(key: string): KnowledgeKindDto | null {
  const prefix = key.split('-')[0];
  const found = Object.entries(KIND_KEY_PREFIXES).find(
    ([, candidate]) => candidate === prefix,
  );

  return found ? (found[0] as KnowledgeKindDto) : null;
}
