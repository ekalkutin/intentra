/**
 * The linked-knowledge scene continues the interview: the same fictional
 * product, the records the interview produced, and the Drafts that come in
 * after it. Copy lives in the landing locale, per product.
 */
export type RecordState =
  'approved' | 'review' | 'obsolete' | 'open' | 'answered';

export type Verdict = 'approve' | 'decline';

export type ProposalLink = 'replaces' | 'answers' | 'dependsOn' | 'concerns';

/** The rule the scene turns on, and the key that replaces it. */
export const RULE = { id: 'BR-12', next: 'BR-13' } as const;

/** Drafts that arrive one after another; each waits for a person's decision. */
export const PROPOSALS = [
  {
    key: 'rule',
    id: RULE.next,
    kind: 'business-rule',
    source: 'interview',
    link: 'replaces',
    target: RULE.id,
  },
  {
    key: 'scenario',
    id: 'SC-9',
    kind: 'scenario',
    source: 'agent',
    link: 'replaces',
    target: 'SC-8',
  },
  {
    key: 'answer',
    id: 'DEC-7',
    kind: 'decision',
    source: 'manual',
    link: 'answers',
    target: 'OQ-5',
  },
  {
    key: 'need',
    id: 'REQ-25',
    kind: 'requirement',
    source: 'agent',
    link: 'dependsOn',
    target: 'REQ-24',
  },
  {
    key: 'audit',
    id: 'OQ-6',
    kind: 'open-question',
    source: 'audit',
    link: 'concerns',
    target: RULE.id,
  },
  {
    key: 'limit',
    id: 'CON-3',
    kind: 'constraint',
    source: 'manual',
    link: 'concerns',
    target: 'REQ-24',
  },
] as const;

export type Proposal = (typeof PROPOSALS)[number];

/** What happened to a record because of a decision; its history, newest last. */
export interface RecordEvent {
  readonly type: 'replaced' | 'declined' | 'answered' | 'linked' | 'review';
  /** The Draft the decision was about. */
  readonly by: string;
  /** What the record was called before, when it was replaced. */
  readonly was?: string;
  readonly link?: ProposalLink;
}

export interface LinkedRecord {
  readonly id: string;
  readonly kind: Proposal['kind'];
  /** Where its title lives: among the interview's records, or the Drafts that came in. */
  readonly title:
    | {
        readonly from: 'records';
        readonly key: 'scenario' | 'requirement' | 'question';
      }
    | { readonly from: 'rule' }
    | { readonly from: 'proposals'; readonly key: Proposal['key'] };
  /** Where its statement lives: the interview's answer, or the Draft's own text. */
  readonly body?:
    | { readonly from: 'interview'; readonly turn: 'flow' | 'need' }
    | { readonly from: 'proposals'; readonly key: Proposal['key'] };
  readonly state: RecordState;
  readonly events: readonly RecordEvent[];
}

export interface KnowledgeState {
  readonly records: readonly LinkedRecord[];
  readonly verdicts: readonly Verdict[];
}

/** What the interview left behind: a rule, a scenario, a requirement and an open question. */
export const INITIAL_KNOWLEDGE: KnowledgeState = {
  records: [
    {
      id: RULE.id,
      kind: 'business-rule',
      title: { from: 'rule' },
      state: 'approved',
      events: [],
    },
    {
      id: 'SC-8',
      kind: 'scenario',
      title: { from: 'records', key: 'scenario' },
      body: { from: 'interview', turn: 'flow' },
      state: 'approved',
      events: [],
    },
    {
      id: 'REQ-24',
      kind: 'requirement',
      title: { from: 'records', key: 'requirement' },
      body: { from: 'interview', turn: 'need' },
      state: 'approved',
      events: [],
    },
    {
      id: 'OQ-5',
      kind: 'open-question',
      title: { from: 'records', key: 'question' },
      state: 'open',
      events: [],
    },
  ],
  verdicts: [],
};

/** Whether the replacement rule is in force. */
export function ruleReplaced(state: KnowledgeState): boolean {
  return state.records.some(record => record.id === RULE.next);
}

/** A link to the rule follows it to its replacement. */
export function currentKey(target: string, state: KnowledgeState): string {
  return ruleReplaced(state) && target === RULE.id ? RULE.next : target;
}

/**
 * The record a Draft is about: what it would replace, answer, depend on or
 * concern, or, once a replacement is approved, the replacement itself.
 */
export function touched(
  state: KnowledgeState,
  proposal: Proposal,
): LinkedRecord | undefined {
  const replacement =
    proposal.link === 'replaces'
      ? state.records.find(record => record.id === proposal.id)
      : undefined;
  return (
    replacement ??
    state.records.find(
      record => record.id === currentKey(proposal.target, state),
    )
  );
}

/** What a decision changes in the knowledge that rests on the Draft. */
export function decide(
  state: KnowledgeState,
  proposal: Proposal,
  verdict: Verdict,
): KnowledgeState {
  const verdicts = [...state.verdicts, verdict];
  const target = currentKey(proposal.target, state);
  const change = (
    id: string,
    with_: (record: LinkedRecord) => LinkedRecord,
  ): LinkedRecord[] =>
    state.records.map(record => (record.id === id ? with_(record) : record));
  const noted = (record: LinkedRecord, event: RecordEvent): LinkedRecord => ({
    ...record,
    events: [...record.events, event],
  });

  if (verdict === 'decline')
    return {
      records: change(target, record =>
        noted(record, { type: 'declined', by: proposal.id }),
      ),
      verdicts,
    };

  const arrived = (recordState: RecordState): LinkedRecord => ({
    id: proposal.id,
    kind: proposal.kind,
    title: { from: 'proposals', key: proposal.key },
    body: { from: 'proposals', key: proposal.key },
    state: recordState,
    events: [],
  });
  const linked: RecordEvent = {
    type: 'linked',
    by: proposal.id,
    link: proposal.link,
  };

  switch (proposal.key) {
    case 'rule':
      // The rule takes its new key; what depends on it is marked for review.
      return {
        records: state.records.map(record => {
          if (record.id === target)
            return noted(
              { ...record, id: proposal.id },
              { type: 'replaced', by: proposal.id, was: target },
            );
          if (
            ['scenario', 'requirement'].includes(record.kind) &&
            record.state === 'approved'
          )
            return noted(
              { ...record, state: 'review' },
              { type: 'review', by: proposal.id },
            );
          return record;
        }),
        verdicts,
      };
    case 'scenario':
      // The replacement takes the old scenario's place, already checked.
      return {
        records: change(target, record =>
          noted(
            { ...arrived('approved'), events: record.events },
            { type: 'replaced', by: proposal.id, was: target },
          ),
        ),
        verdicts,
      };
    case 'answer':
      // An approved answer closes the question it answers.
      return {
        records: [
          ...change(target, record =>
            noted(
              { ...record, state: 'answered' },
              { type: 'answered', by: proposal.id },
            ),
          ),
          arrived('approved'),
        ],
        verdicts,
      };
    case 'audit':
      // A question Intentra raised stays open until someone answers it.
      return {
        records: [
          ...change(target, record => noted(record, linked)),
          arrived('open'),
        ],
        verdicts,
      };
    case 'need':
    case 'limit':
      return {
        records: [
          ...change(target, record => noted(record, linked)),
          arrived('approved'),
        ],
        verdicts,
      };
  }
}
