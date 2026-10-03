import {
  ArrowDown,
  Check,
  MessageSquare,
  RotateCcw,
  SquareTerminal,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  KindBadge,
  KindIcon,
  KnowledgeStatusBadge,
  NeedsReviewBadge,
} from '@/entities/knowledge-item';
import { cn } from '@/shared/lib';
import { Button, StatusBadge } from '@/shared/ui';

import { DEMO_CASE_NAMES, type DemoCase } from '../model/demo-interview';
import {
  currentKey,
  decide,
  INITIAL_KNOWLEDGE,
  PROPOSALS,
  RULE,
  ruleReplaced,
  touched,
  type LinkedRecord,
  type Verdict,
} from '../model/knowledge-flow';

const AGENTS = ['claude', 'codex', 'cursor'] as const;

/** How long a decided Draft takes to leave. */
const LEAVE_MS = 420;
/** How long the touched record shows what the decision did, before the next Draft comes in. */
const REST_MS = 1400;

function RecordStatus({ state }: { readonly state: LinkedRecord['state'] }) {
  const { t } = useTranslation();
  if (state === 'review') return <NeedsReviewBadge />;
  if (state === 'open')
    return (
      <StatusBadge status='pending'>
        {t('landing.knowledge.states.open')}
      </StatusBadge>
    );
  if (state === 'answered')
    return (
      <StatusBadge status='done'>
        {t('landing.knowledge.states.answered')}
      </StatusBadge>
    );
  return <KnowledgeStatusBadge status={state} />;
}

/**
 * Linked knowledge at work: Drafts come in one after another, the record
 * each one is about stands in the middle, and a decision rewrites it in
 * place — a new figure, a new key, a closed question, a line of history —
 * while the project's records beside it follow. Only what a person approved
 * goes on to the coding agents. Local only, on the interview's product.
 */
export function KnowledgeScene({
  topic,
  onAnother,
}: {
  readonly topic: DemoCase;
  /** Starts the page over on a different product. */
  readonly onAnother: () => void;
}) {
  const { t } = useTranslation();
  const copy = `landing.knowledge.cases.${topic}` as const;
  const [knowledge, setKnowledge] = useState(INITIAL_KNOWLEDGE);
  const [leaving, setLeaving] = useState<Verdict | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  // While a decision settles, the Draft that was decided stays the subject.
  const step = knowledge.verdicts.length - (leaving ? 1 : 0);
  const proposal = PROPOSALS[step];
  const replaced = ruleReplaced(knowledge);
  const focus =
    (proposal && touched(knowledge, proposal)) ?? knowledge.records[0]!;
  const approvedCount = knowledge.verdicts.filter(
    verdict => verdict === 'approve',
  ).length;
  // The newest approved record is what the agents were handed last.
  const delivered =
    PROPOSALS.findLast((_, index) => knowledge.verdicts[index] === 'approve')
      ?.id ?? RULE.id;

  const title = (record: LinkedRecord) =>
    record.title.from === 'rule'
      ? t(`${copy}.rule.title`)
      : record.title.from === 'records'
        ? t(`${copy}.records.${record.title.key}`)
        : t(`${copy}.proposals.${record.title.key}.title`);
  const body = (record: LinkedRecord) => {
    // The interview's open question says whether it has been answered, and how.
    if (record.title.from === 'records' && record.title.key === 'question')
      return record.state === 'answered'
        ? t(`${copy}.proposals.answer.text`)
        : t('landing.knowledge.unanswered');
    if (!record.body) return null;
    return record.body.from === 'interview'
      ? t(`landing.demoSection.cases.${topic}.${record.body.turn}.a.text`)
      : t(`${copy}.proposals.${record.body.key}.text`);
  };

  const settle = (verdict: Verdict) => {
    if (!proposal || leaving) return;
    setKnowledge(state => decide(state, proposal, verdict));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setLeaving(verdict);
    timer.current = setTimeout(
      () => setLeaving(null),
      verdict === 'approve' ? REST_MS : LEAVE_MS,
    );
  };
  return (
    <section
      id='benefits'
      className='landing-knowledge-scene'
      aria-labelledby='knowledge-scene-title'
    >
      <div className='landing-wrap'>
        <div className='landing-knowledge-heading'>
          <h2 id='knowledge-scene-title'>{t('landing.knowledge.title')}</h2>
          <p>{t('landing.knowledge.text')}</p>
        </div>
        <div className='landing-knowledge-map'>
          <div className='landing-inbox'>
            <div className='landing-inbox-heading'>
              <span>
                {t('landing.knowledge.inbox')} · {DEMO_CASE_NAMES[topic]}
              </span>
              <code>
                {Math.min(step + 1, PROPOSALS.length)} / {PROPOSALS.length}
              </code>
            </div>
            {proposal ? (
              <article
                key={proposal.id}
                className={cn(
                  'landing-proposal',
                  leaving && `is-leaving-${leaving}`,
                )}
              >
                <div className='landing-rule-meta'>
                  <code>{proposal.id}</code>
                  <KnowledgeStatusBadge status='draft' />
                </div>
                <KindBadge kind={proposal.kind} />
                <h3>{t(`${copy}.proposals.${proposal.key}.title`)}</h3>
                <p>{t(`${copy}.proposals.${proposal.key}.text`)}</p>
                <p className='landing-proposal-link'>
                  {t(`landing.knowledge.links.${proposal.link}`)}{' '}
                  <code>
                    {leaving
                      ? proposal.target
                      : currentKey(proposal.target, knowledge)}
                  </code>
                  <span>
                    {t(`landing.knowledge.sources.${proposal.source}`)}
                  </span>
                </p>
                <div className='landing-proposal-actions'>
                  <Button
                    disabled={!!leaving}
                    onClick={() => settle('approve')}
                  >
                    <Check data-icon='inline-start' />
                    {t('landing.knowledge.approve')}
                  </Button>
                  <Button
                    variant='ghost'
                    disabled={!!leaving}
                    onClick={() => settle('decline')}
                  >
                    <X data-icon='inline-start' />
                    {t('landing.knowledge.decline')}
                  </Button>
                </div>
              </article>
            ) : (
              <div className='landing-inbox-done'>
                <p>{t('landing.knowledge.done')}</p>
                <p>
                  {t('landing.knowledge.summary', {
                    approved: approvedCount,
                    declined: PROPOSALS.length - approvedCount,
                  })}
                </p>
                <div className='landing-outro'>
                  <Button render={<a href='#agents' />} nativeButton={false}>
                    {t('landing.knowledge.next')}
                    <ArrowDown data-icon='inline-end' />
                  </Button>
                  <Button variant='outline' onClick={onAnother}>
                    <RotateCcw data-icon='inline-start' />
                    {t('landing.knowledge.more')}
                  </Button>
                </div>
              </div>
            )}
            <p className='landing-inbox-status' role='status'>
              {proposal &&
                !leaving &&
                step + 1 < PROPOSALS.length &&
                t('landing.knowledge.waiting', {
                  count: PROPOSALS.length - step - 1,
                })}
            </p>
          </div>
          <article
            // A new subject settles in; the same subject changes in place.
            key={proposal?.key ?? 'rest'}
            className='landing-rule-sheet'
            data-state={focus.state}
            aria-label={t('landing.knowledge.focus')}
          >
            <div className='landing-rule-meta'>
              <code key={focus.id}>{focus.id}</code>
              <RecordStatus state={focus.state} />
            </div>
            <KindBadge kind={focus.kind} />
            <h3 key={`title-${focus.id}`}>{title(focus)}</h3>
            {focus.title.from === 'rule' ? (
              <>
                <div
                  className='landing-rule-value'
                  key={replaced ? 'after' : 'before'}
                >
                  <span>
                    {t(`${copy}.rule.${replaced ? 'after' : 'before'}.value`)}
                  </span>
                  <span>
                    {t(`${copy}.rule.${replaced ? 'after' : 'before'}.unit`)}
                  </span>
                </div>
                <p className='landing-rule-meaning'>
                  {t(`${copy}.rule.meaning`)}
                </p>
                <div className='landing-rule-source'>
                  <MessageSquare size={13} aria-hidden />
                  <span>
                    {t(`${copy}.rule.${replaced ? 'after' : 'before'}.source`)}
                  </span>
                </div>
              </>
            ) : (
              body(focus) && (
                <p
                  className='landing-rule-body'
                  key={`body-${focus.id}-${focus.state}`}
                >
                  {body(focus)}
                </p>
              )
            )}
            <ol className='landing-rule-history'>
              <li>{t('landing.knowledge.historyBefore')}</li>
              {focus.events.map(event => (
                <li key={`${event.type}-${event.by}`} data-type={event.type}>
                  {event.type === 'linked'
                    ? t('landing.knowledge.events.linked', {
                        by: event.by,
                        link: t(`landing.knowledge.links.${event.link!}`),
                        id: focus.id,
                      })
                    : t(`landing.knowledge.events.${event.type}`, {
                        by: event.by,
                        was: event.was ?? '',
                      })}
                </li>
              ))}
            </ol>
          </article>
          <div className='landing-model-dependents'>
            <p className='landing-linked-heading'>
              {t('landing.knowledge.linked')}
              <code>{knowledge.records.length}</code>
            </p>
            <ul>
              {knowledge.records.map(record => (
                <li
                  // A changed status replays the row's arrival, so the effect is seen.
                  key={`${record.id}-${record.state}`}
                  className='landing-linked-record'
                  data-state={record.state}
                  data-focus={record.id === focus.id}
                >
                  <code>{record.id}</code>
                  <KindIcon kind={record.kind} />
                  <span>{title(record)}</span>
                  <RecordStatus state={record.state} />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className='landing-delivery'>
          <p>{t('landing.knowledge.delivery')}</p>
          <ul>
            {AGENTS.map(agent => (
              <li
                // A new delivery replays the cell's arrival.
                key={`${agent}-${delivered}`}
                className='landing-delivery-agent'
                data-fresh={approvedCount > 0}
              >
                <strong>
                  <SquareTerminal size={16} aria-hidden />
                  {t(`landing.strip.${agent}`)}
                </strong>
                <code>
                  <span>get_context →</span> {delivered}
                  <Check size={13} aria-hidden />
                </code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
