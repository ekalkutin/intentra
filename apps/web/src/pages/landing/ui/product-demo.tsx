import {
  ArrowDown,
  Check,
  CheckCheck,
  Layers,
  MessageSquare,
  PenLine,
  RotateCcw,
  SearchCheck,
  TriangleAlert,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  KindBadge,
  KindIcon,
  KnowledgeStatusBadge,
} from '@/entities/knowledge-item';
import { DEFAULT_TONE, nextPhrase, useThinkingPhrases } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AgentSpark,
  Bubble,
  BubbleContent,
  Button,
  Card,
  CardContent,
  CardFooter,
  MATERIALISE,
  Message,
  MessageContent,
  MessageHeader,
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  RecordWave,
  transferCard,
} from '@/shared/ui';

import {
  another,
  DEMO_CASES,
  DEMO_ISSUE,
  DEMO_OPTIONS,
  DEMO_PACE,
  DEMO_TURNS,
  type DemoCase,
  type DemoOption,
} from '../model/demo-interview';

import { DemoInvite } from './demo-invite';

type DraftKind = (typeof DEMO_TURNS)[number]['kind'] | typeof DEMO_ISSUE.kind;

interface Draft {
  readonly id: string;
  readonly kind: DraftKind;
  readonly title: string;
  readonly text: string;
  /** The question whose answer it came from. */
  readonly from: number;
  readonly landed: boolean;
}

/** What the transcript holds, in order. */
type Entry =
  | { readonly id: string; readonly type: 'user'; readonly text: string }
  | {
      readonly id: string;
      readonly type: 'agent';
      readonly text: string;
      /** A question carries its number; a finding carries a warning mark. */
      readonly question?: number;
      readonly finding?: boolean;
    }
  | {
      readonly id: string;
      readonly type: 'choices';
      readonly turn: number;
      readonly order: readonly DemoOption[];
    }
  | { readonly id: string; readonly type: 'record'; readonly draft: string }
  /** The two ways on, once the interview is over. */
  | { readonly id: string; readonly type: 'outro' };

/** What Intentra does next; the conversation is a list of these, played one by one. */
type Step =
  | { readonly do: 'show'; readonly entry: Entry }
  | {
      readonly do: 'work';
      readonly ms: number;
      readonly status?: 'recording' | 'checking';
    }
  | { readonly do: 'say'; readonly entry: Entry & { type: 'agent' } }
  | { readonly do: 'record'; readonly draft: Draft }
  | { readonly do: 'wait' };

type Live =
  | { readonly kind: 'thinking'; readonly phrase: string }
  | { readonly kind: 'status'; readonly status: 'recording' | 'checking' }
  | null;

const add = <T extends { readonly id: string }>(
  items: readonly T[],
  item: T,
) =>
  items.some(existing => existing.id === item.id) ? items : [...items, item];

/**
 * A short interview the visitor answers themselves, played the way the real
 * chat behaves: the message is sent, Intentra thinks, its question streams in,
 * the answer is recorded as a Draft that flies to the panel, and where an
 * answer leaves something open Intentra says so and records the question.
 * Each run takes one of several fictional products. Local only.
 */
export function ProductDemo({
  topic,
  onTopicChange,
}: {
  readonly topic: DemoCase;
  /** The scenes below continue whichever product the interview is about. */
  readonly onTopicChange: (topic: DemoCase) => void;
}) {
  const { t } = useTranslation();
  const phrases = useThinkingPhrases(DEFAULT_TONE);
  const [open, setOpen] = useState(false);
  /** The product this interview last started on, to tell its own change from the page's. */
  const chosen = useRef(topic);
  const [script, setScript] = useState<readonly Step[]>([]);
  const [cursor, setCursor] = useState(0);
  const [feed, setFeed] = useState<readonly Entry[]>([]);
  const [live, setLive] = useState<Live>(null);
  const [stream, setStream] = useState<{ id: string; shown: number } | null>(
    null,
  );
  const [drafts, setDrafts] = useState<readonly Draft[]>([]);
  const [turn, setTurn] = useState(0);
  const [approved, setApproved] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [run, setRun] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const source = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLDivElement>(null);
  const phrase = useRef<string | null>(null);
  const landed = drafts.filter(draft => draft.landed);
  const incoming = drafts.find(draft => !draft.landed);
  const step = script[cursor];
  const complete = open && cursor >= script.length && script.length > 0;

  const question = (index: number): Step[] => [
    { do: 'work', ms: DEMO_PACE.think },
    {
      do: 'say',
      entry: {
        id: `q-${run}-${index}`,
        type: 'agent',
        question: index + 1,
        text: t(
          `landing.demoSection.cases.${topic}.${DEMO_TURNS[index]!.key}.question`,
        ),
      },
    },
    {
      do: 'show',
      entry: {
        id: `c-${run}-${index}`,
        type: 'choices',
        turn: index,
        order: Math.random() < 0.5 ? DEMO_OPTIONS : [...DEMO_OPTIONS].reverse(),
      },
    },
    { do: 'wait' },
  ];

  const begin = (subject: DemoCase, next: number) => {
    chosen.current = subject;
    onTopicChange(subject);
    setRun(next);
    setFeed([]);
    setDrafts([]);
    setApproved([]);
    setExpanded([]);
    setLive(null);
    setStream(null);
    setTurn(0);
    setCursor(0);
    setScript([]);
    setOpen(true);
  };

  // A product picked further down the page starts the interview over, at its invitation.
  useEffect(() => {
    if (chosen.current === topic) return;
    chosen.current = topic;
    setOpen(false);
    setScript([]);
    setCursor(0);
    setFeed([]);
    setDrafts([]);
    setLive(null);
    setStream(null);
  }, [topic]);

  // The opening script is built once the topic and run are in place.
  useEffect(() => {
    if (!open || script.length > 0) return;
    setScript([
      {
        do: 'show',
        entry: {
          id: `intro-${run}`,
          type: 'user',
          text: t(`landing.demoSection.cases.${topic}.intro`),
        },
      },
      ...question(0),
    ]);
    // Rebuilding on a language change would restart a conversation in progress.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, run]);

  // Plays the current step. Every branch is safe to run twice.
  useEffect(() => {
    if (!step) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const advance = () => setCursor(value => value + 1);
    let timer: ReturnType<typeof setTimeout> | undefined;
    let ticker: ReturnType<typeof setInterval> | undefined;
    let cancelFlight = () => {};

    if (step.do === 'show') {
      setFeed(items => add(items, step.entry));
      timer = setTimeout(advance, still ? 0 : DEMO_PACE.sent);
    } else if (step.do === 'work') {
      if (step.status) setLive({ kind: 'status', status: step.status });
      else {
        phrase.current = nextPhrase(phrases, phrase.current);
        setLive({ kind: 'thinking', phrase: phrase.current });
      }
      timer = setTimeout(
        () => {
          setLive(null);
          advance();
        },
        still ? 0 : step.ms,
      );
    } else if (step.do === 'say') {
      const { entry } = step;
      setFeed(items => add(items, entry));
      if (entry.question) setTurn(entry.question - 1);
      if (still) {
        timer = setTimeout(advance, 0);
      } else {
        let shown = 0;
        setStream({ id: entry.id, shown });
        ticker = setInterval(() => {
          shown += DEMO_PACE.streamChars;
          if (shown < entry.text.length) {
            setStream({ id: entry.id, shown });
            return;
          }
          clearInterval(ticker);
          setStream(null);
          timer = setTimeout(advance, DEMO_PACE.settle);
        }, DEMO_PACE.streamTick);
      }
    } else if (step.do === 'record') {
      const { draft } = step;
      setDrafts(items => add(items, draft));
      setFeed(items =>
        add(items, { id: `r-${draft.id}`, type: 'record', draft: draft.id }),
      );
      const land = () => {
        // The arrival ring outlives the step; only an unfinished flight is cancelled.
        cancelFlight = () => {};
        setDrafts(items =>
          items.map(item =>
            item.id === draft.id ? { ...item, landed: true } : item,
          ),
        );
        timer = setTimeout(advance, still ? 0 : DEMO_PACE.settle);
      };
      timer = setTimeout(
        () => {
          if (!source.current || !target.current) {
            land();
            return;
          }
          cancelFlight = transferCard(source.current, target.current, {
            onLand: land,
            surface:
              root.current?.closest<HTMLElement>('.landing') ?? document.body,
            reduced: still,
            prepare: copy => {
              copy.style.visibility = 'visible';
            },
          });
        },
        still ? 0 : MATERIALISE.waveMs * MATERIALISE.wavePasses + 50,
      );
    }
    return () => {
      clearTimeout(timer);
      clearInterval(ticker);
      cancelFlight();
    };
    // The step is the only thing this plays; phrases and refs are read as they are.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const answer = (entry: Entry & { type: 'choices' }, option: DemoOption) => {
    const spec = DEMO_TURNS[entry.turn]!;
    const copy = `landing.demoSection.cases.${topic}.${spec.key}` as const;
    const finding = t(`${copy}.${option}.finding`);
    const issues = drafts.filter(draft => draft.kind === DEMO_ISSUE.kind);
    const next: Step[] = [
      { do: 'work', ms: DEMO_PACE.record, status: 'recording' },
      {
        do: 'record',
        draft: {
          id: `${spec.prefix}-${spec.first}`,
          kind: spec.kind,
          title: t(`${copy}.title`),
          text: t(`${copy}.${option}.text`),
          from: entry.turn + 1,
          landed: false,
        },
      },
    ];
    // Where the answer leaves something open, Intentra says so and keeps the question.
    if (finding)
      next.push(
        { do: 'work', ms: DEMO_PACE.check, status: 'checking' },
        {
          do: 'say',
          entry: {
            id: `f-${run}-${entry.turn}`,
            type: 'agent',
            finding: true,
            text: finding,
          },
        },
        { do: 'work', ms: DEMO_PACE.record, status: 'recording' },
        {
          do: 'record',
          draft: {
            id: `${DEMO_ISSUE.prefix}-${DEMO_ISSUE.first + issues.length}`,
            kind: DEMO_ISSUE.kind,
            title: t(`${copy}.${option}.issueTitle`),
            text: t(`${copy}.${option}.issueText`),
            from: entry.turn + 1,
            landed: false,
          },
        },
      );
    if (entry.turn + 1 < DEMO_TURNS.length)
      next.push(...question(entry.turn + 1));
    else
      next.push(
        { do: 'work', ms: DEMO_PACE.think },
        {
          do: 'say',
          entry: {
            id: `end-${run}`,
            type: 'agent',
            text: t('landing.demoSection.closing'),
          },
        },
        { do: 'show', entry: { id: `outro-${run}`, type: 'outro' } },
      );
    setFeed(items =>
      items.map(item =>
        item.id === entry.id
          ? {
              id: entry.id,
              type: 'user',
              text: t(`${copy}.${option}.answer`),
            }
          : item,
      ),
    );
    setExpanded([]);
    setScript(steps => [...steps.slice(0, cursor + 1), ...next]);
    setCursor(value => value + 1);
  };

  if (!open)
    return (
      <DemoInvite
        message={t(`landing.demoSection.cases.${topic}.intro`)}
        onStart={() => begin(topic, run)}
      />
    );

  return (
    <Card ref={root} className='landing-demo landing-interview'>
      <CardContent className='landing-demo-body'>
        <div className='landing-interview-chat'>
          <div className='landing-interview-heading'>
            <span className='landing-speaker'>
              <AgentSpark active={!!live || !!stream} />
              {t('landing.demoSection.analyst')}
            </span>
            <span>
              {t('landing.demoSection.progress', {
                current: turn + 1,
                total: DEMO_TURNS.length,
              })}
            </span>
          </div>
          <MessageScrollerProvider key={run} autoScroll>
            <MessageScroller className='landing-interview-scroller'>
              <MessageScrollerViewport
                tabIndex={0}
                aria-label={t('landing.demoSection.transcript')}
              >
                <MessageScrollerContent className='landing-conversation'>
                  {feed.map(entry => (
                    <MessageScrollerItem
                      key={entry.id}
                      messageId={entry.id}
                      className='landing-interview-turn'
                    >
                      {entry.type === 'user' && (
                        <Message align='end'>
                          <MessageContent>
                            <Bubble variant='muted' align='end'>
                              <BubbleContent className='landing-answer'>
                                <span>{t('landing.demoSection.user')}</span>
                                <p>{entry.text}</p>
                              </BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      )}
                      {entry.type === 'agent' && (
                        <Message>
                          <MessageContent>
                            {entry.question && (
                              <MessageHeader>
                                {t('landing.demoSection.questionNumber', {
                                  number: entry.question,
                                })}
                              </MessageHeader>
                            )}
                            <Bubble variant='ghost'>
                              <BubbleContent
                                className={cn(
                                  entry.question
                                    ? 'landing-analyst-question'
                                    : 'landing-analyst-note',
                                  entry.finding && 'is-finding',
                                )}
                              >
                                {entry.finding && (
                                  <TriangleAlert size={16} aria-hidden />
                                )}
                                <span>
                                  {stream?.id === entry.id
                                    ? entry.text.slice(0, stream.shown)
                                    : entry.text}
                                  {stream?.id === entry.id && (
                                    <i className='landing-terminal-caret' />
                                  )}
                                </span>
                              </BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      )}
                      {entry.type === 'choices' && (
                        <div className='landing-choices'>
                          <p>{t('landing.demoSection.choose')}</p>
                          {entry.order.map((option, number) => (
                            <Button
                              key={option}
                              variant='outline'
                              className='landing-choice'
                              onClick={() => answer(entry, option)}
                            >
                              <code>{number + 1}</code>
                              {t(
                                `landing.demoSection.cases.${topic}.${DEMO_TURNS[entry.turn]!.key}.${option}.answer`,
                              )}
                            </Button>
                          ))}
                        </div>
                      )}
                      {entry.type === 'outro' && (
                        <div className='landing-outro'>
                          <Button
                            render={<a href='#benefits' />}
                            nativeButton={false}
                          >
                            {t('landing.demoSection.next')}
                            <ArrowDown data-icon='inline-end' />
                          </Button>
                          <Button
                            variant='outline'
                            onClick={() =>
                              begin(another(DEMO_CASES, topic), run + 1)
                            }
                          >
                            <RotateCcw data-icon='inline-start' />
                            {t('landing.demoSection.more')}
                          </Button>
                        </div>
                      )}
                      {entry.type === 'record' &&
                        drafts
                          .filter(draft => draft.id === entry.draft)
                          .map(draft => (
                            <div
                              key={draft.id}
                              ref={draft.landed ? undefined : source}
                              className='landing-record-line'
                            >
                              <RecordWave play={!draft.landed}>
                                {draft.landed ? (
                                  <Check size={14} aria-hidden />
                                ) : (
                                  <KindIcon kind={draft.kind} />
                                )}
                                <code>{draft.id}</code>
                                <span>{draft.title}</span>
                              </RecordWave>
                            </div>
                          ))}
                    </MessageScrollerItem>
                  ))}
                  {live && (
                    <MessageScrollerItem
                      messageId='live'
                      className='landing-interview-turn'
                    >
                      <p className='landing-live' role='status'>
                        {live.kind === 'thinking' ? (
                          <>
                            <AgentSpark active />
                            <span className='shimmer'>{live.phrase}…</span>
                          </>
                        ) : (
                          <>
                            {live.status === 'recording' ? (
                              <PenLine size={16} aria-hidden />
                            ) : (
                              <SearchCheck size={16} aria-hidden />
                            )}
                            <span className='shimmer'>
                              {t(`landing.demoSection.${live.status}`)}
                            </span>
                          </>
                        )}
                      </p>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton
                aria-label={t('landing.demoSection.latest')}
              >
                <ArrowDown />
              </MessageScrollerButton>
            </MessageScroller>
          </MessageScrollerProvider>
        </div>
        <aside
          className='landing-drafts'
          aria-label={t('landing.demoSection.drafts')}
        >
          <div className='landing-drafts-heading'>
            <Layers size={16} aria-hidden />
            <span>{t('landing.demoSection.drafts')}</span>
            <span>{landed.length}</span>
          </div>
          <div className='landing-interview-draft-area'>
            {drafts.length === 0 && (
              <p className='landing-draft-empty'>
                {t('landing.demoSection.emptyTitle')}
              </p>
            )}
            <Accordion
              value={expanded}
              onValueChange={value => setExpanded(value as string[])}
              className='landing-interview-records'
            >
              {drafts.map(draft => {
                const isApproved = approved.includes(draft.id);
                return (
                  <div
                    key={draft.id}
                    ref={draft.landed ? undefined : target}
                    className={cn(
                      'landing-draft-record',
                      isApproved && 'is-approved',
                    )}
                    style={{
                      visibility: draft.landed ? 'visible' : 'hidden',
                    }}
                    inert={!draft.landed}
                    aria-hidden={!draft.landed}
                  >
                    <AccordionItem value={draft.id}>
                      <AccordionTrigger>
                        <span className='landing-draft-summary'>
                          <span className='landing-knowledge-top'>
                            <code>{draft.id}</code>
                            <KnowledgeStatusBadge
                              status={isApproved ? 'approved' : 'draft'}
                            />
                          </span>
                          <span className='landing-draft-title'>
                            {draft.title}
                          </span>
                          <KindBadge kind={draft.kind} />
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className='landing-draft-description'>
                          {draft.text}
                        </p>
                        <p className='landing-draft-source'>
                          <MessageSquare size={13} aria-hidden />
                          {t('landing.demoSection.sourceQuestion', {
                            number: draft.from,
                          })}
                        </p>
                        {isApproved ? (
                          <p className='landing-approved-note'>
                            <CheckCheck size={16} aria-hidden />
                            {t('landing.demoSection.ready')}
                          </p>
                        ) : (
                          <Button
                            size='sm'
                            onClick={() =>
                              setApproved(value => [...value, draft.id])
                            }
                          >
                            <Check data-icon='inline-start' />
                            {t('landing.demoSection.approve')}
                          </Button>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </div>
                );
              })}
            </Accordion>
          </div>
          <p className='landing-demo-status' role='status'>
            {complete
              ? t('landing.demoSection.complete', { count: landed.length })
              : incoming
                ? t('landing.demoSection.recording')
                : landed.length > 0 && t('landing.demoSection.reviewHint')}
          </p>
        </aside>
      </CardContent>
      <CardFooter className='landing-demo-footer'>
        <Button
          variant='ghost'
          size='sm'
          disabled={feed.length < 2}
          onClick={() => begin(another(DEMO_CASES, topic), run + 1)}
        >
          <RotateCcw data-icon='inline-start' />
          {t('landing.demoSection.restart')}
        </Button>
      </CardFooter>
    </Card>
  );
}
