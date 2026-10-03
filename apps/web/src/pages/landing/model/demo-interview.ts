/** Fictional Orbit interview. Copy lives in the landing locale. */
export const DEMO_TURNS = [
  { key: 'refund', id: 'BR-12', kind: 'business-rule' },
  { key: 'cancellation', id: 'SC-08', kind: 'scenario' },
  { key: 'notification', id: 'REQ-24', kind: 'requirement' },
  { key: 'exception', id: 'OQ-05', kind: 'open-question' },
] as const;

export type DemoPhase =
  'question' | 'typing' | 'answer' | 'recording' | 'settled' | 'done';

export const DEMO_DELAY = {
  question: 2600,
  typing: 1800,
  answer: 2400,
  settled: 1800,
} as const;
