/** The records that travel through the hero: said by the team, approved by a person, read by an agent. */
export const FLOW_ITEMS = [
  { key: 'refund', id: 'BR-12', kind: 'business-rule', agent: 'claude' },
  { key: 'cancellation', id: 'SC-08', kind: 'scenario', agent: 'codex' },
  { key: 'notification', id: 'REQ-24', kind: 'requirement', agent: 'cursor' },
] as const;
