import {
  ArrowDown,
  Check,
  CheckCheck,
  CircleDashed,
  MessageSquare,
  RotateCcw,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  KindBadge,
  KindIcon,
  KnowledgeStatusBadge,
} from '@/entities/knowledge-item';
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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  IntentraButton,
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
  DEMO_DELAY,
  DEMO_TURNS,
  type DemoPhase,
} from '../model/demo-interview';

const AUTOPLAY_DELAY = 1800;

/** A finite, local interview rehearsal using the product's actual card choreography. */
export function ProductDemo({
  paused,
  autoPlay = false,
}: {
  readonly paused: boolean;
  readonly autoPlay?: boolean;
}) {
  const { t } = useTranslation();
  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState<DemoPhase>('question');
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [approved, setApproved] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [run, setRun] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const source = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLDivElement>(null);
  const cancelFlight = useRef<() => void>(() => {});
  const complete = phase === 'done';
  const count = turn + (phase === 'settled' || complete ? 1 : 0);
  const running = playing && available && !complete;
  const still = paused || reduced;

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => setReduced(media.matches);
    syncMotion();
    media.addEventListener('change', syncMotion);
    let inView = true;
    const syncVisibility = () => setAvailable(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      syncVisibility();
    });
    if (root.current) observer.observe(root.current);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      observer.disconnect();
      media.removeEventListener('change', syncMotion);
      document.removeEventListener('visibilitychange', syncVisibility);
      cancelFlight.current();
    };
  }, []);

  // In the first viewport the rehearsal begins on its own, after the page has drawn itself.
  useEffect(() => {
    if (!autoPlay || started || paused || !root.current) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(timer);
        if (!entry?.isIntersecting) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        timer = setTimeout(() => {
          setStarted(true);
          setPlaying(true);
        }, AUTOPLAY_DELAY);
      },
      { threshold: 0.05 },
    );
    observer.observe(root.current);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [autoPlay, started, paused]);

  useEffect(() => {
    if (!running) return;
    if (phase === 'recording') {
      let landed = false;
      const timer = setTimeout(
        () => {
          const onLand = () => {
            landed = true;
            setPhase('settled');
          };
          if (!source.current || !target.current) {
            onLand();
            return;
          }
          cancelFlight.current();
          cancelFlight.current = transferCard(source.current, target.current, {
            onLand,
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
      return () => {
        clearTimeout(timer);
        // Keep the arrival ring alive after landing; interruption cancels the flight.
        if (!landed) cancelFlight.current();
      };
    }
    const timer = setTimeout(() => {
      if (phase === 'question') setPhase('typing');
      else if (phase === 'typing') setPhase('answer');
      else if (phase === 'answer') setPhase('recording');
      else if (turn === DEMO_TURNS.length - 1) {
        setPhase('done');
        setPlaying(false);
      } else {
        setTurn(value => value + 1);
        setPhase('question');
      }
    }, DEMO_DELAY[phase]);
    return () => clearTimeout(timer);
  }, [phase, running, still, turn, run]);

  const restart = () => {
    cancelFlight.current();
    setTurn(0);
    setPhase('question');
    setApproved([]);
    setExpanded([]);
    setRun(value => value + 1);
    setStarted(true);
    setPlaying(true);
  };
  const advance = () => {
    setStarted(true);
    setPlaying(true);
    setExpanded([]);
    if (phase === 'settled') {
      if (turn === DEMO_TURNS.length - 1) {
        setPhase('done');
        setPlaying(false);
      } else {
        setTurn(value => value + 1);
        setPhase('question');
      }
    } else setPhase('recording');
  };

  return (
    <Card
      ref={root}
      className='landing-demo landing-interview'
      data-phase={phase}
      data-playing={running}
    >
      <CardHeader className='landing-demo-bar'>
        <CardTitle>
          <MessageSquare size={14} aria-hidden />
          {t('landing.demoSection.project')}
        </CardTitle>
        <CardDescription>{t('landing.demoSection.label')}</CardDescription>
      </CardHeader>
      <CardContent className='landing-demo-body'>
        <div className='landing-interview-chat'>
          <div className='landing-interview-heading'>
            <span className='landing-speaker'>
              <AgentSpark active={running && !still} />
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
                  <MessageScrollerItem
                    messageId='intro'
                    className='landing-interview-turn'
                  >
                    <Message align='end'>
                      <MessageContent>
                        <Bubble variant='muted' align='end'>
                          <BubbleContent className='landing-answer'>
                            <span>{t('landing.demoSection.user')}</span>
                            <p>{t('landing.demoSection.intro')}</p>
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                  {DEMO_TURNS.slice(0, turn + 1).map((item, index) => {
                    const current = index === turn;
                    const hasAnswer =
                      !current || !['question', 'typing'].includes(phase);
                    const hasRecord =
                      index < count || (current && phase === 'recording');
                    return (
                      <MessageScrollerItem
                        key={item.id}
                        messageId={item.id}
                        className='landing-interview-turn'
                      >
                        <Message>
                          <MessageContent>
                            <MessageHeader>
                              {t('landing.demoSection.questionNumber', {
                                number: index + 1,
                              })}
                            </MessageHeader>
                            <Bubble variant='ghost'>
                              <BubbleContent className='landing-analyst-question'>
                                {t(
                                  `landing.demoSection.turns.${item.key}.question`,
                                )}
                              </BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                        {(hasAnswer || (current && phase === 'typing')) && (
                          <Message align='end'>
                            <MessageContent>
                              <Bubble variant='muted' align='end'>
                                <BubbleContent className='landing-answer'>
                                  <span>{t('landing.demoSection.user')}</span>
                                  {hasAnswer ? (
                                    <p>
                                      {t(
                                        `landing.demoSection.turns.${item.key}.answer`,
                                      )}
                                    </p>
                                  ) : (
                                    <span
                                      className={cn(
                                        'landing-demo-typing',
                                        running && !still && 'shimmer',
                                      )}
                                    >
                                      {t('landing.demoSection.typing')}
                                    </span>
                                  )}
                                </BubbleContent>
                              </Bubble>
                            </MessageContent>
                          </Message>
                        )}
                        {hasRecord && (
                          <div
                            ref={current ? source : undefined}
                            className='landing-record-line'
                          >
                            <RecordWave
                              key={`${run}-${running}`}
                              play={
                                current &&
                                phase === 'recording' &&
                                running &&
                                !still
                              }
                            >
                              {index < count ? (
                                <Check size={14} aria-hidden />
                              ) : (
                                <KindIcon kind={item.kind} />
                              )}
                              <code>{item.id}</code>
                              <span>
                                {t(
                                  `landing.demoSection.turns.${item.key}.title`,
                                )}
                              </span>
                            </RecordWave>
                          </div>
                        )}
                      </MessageScrollerItem>
                    );
                  })}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton
                aria-label={t('landing.demoSection.latest')}
              >
                <ArrowDown />
              </MessageScrollerButton>
            </MessageScroller>
          </MessageScrollerProvider>
          <div className='landing-interview-controls'>
            <IntentraButton
              size='default'
              onClick={() => {
                if (complete) restart();
                else {
                  setStarted(true);
                  setPlaying(value => !value);
                }
              }}
              aria-label={t(
                complete
                  ? 'landing.demoSection.reset'
                  : playing
                    ? 'landing.demoSection.pause'
                    : started
                      ? 'landing.demoSection.resume'
                      : 'landing.demoSection.play',
              )}
            >
              {t(
                complete
                  ? 'landing.demoSection.reset'
                  : playing
                    ? 'landing.demoSection.pause'
                    : started
                      ? 'landing.demoSection.resume'
                      : 'landing.demoSection.play',
              )}
            </IntentraButton>
            {!complete && (
              <Button
                variant='ghost'
                size='sm'
                disabled={phase === 'recording'}
                onClick={advance}
              >
                {t(
                  phase === 'recording'
                    ? 'landing.demoSection.recording'
                    : phase === 'settled'
                      ? 'landing.demoSection.next'
                      : 'landing.demoSection.showAnswer',
                )}
              </Button>
            )}
          </div>
        </div>
        <aside
          className='landing-drafts'
          aria-label={t('landing.demoSection.drafts')}
        >
          <div className='landing-drafts-heading'>
            <CircleDashed size={16} aria-hidden />
            <span>{t('landing.demoSection.drafts')}</span>
            <span>
              {count} / {DEMO_TURNS.length}
            </span>
          </div>
          <div className='landing-interview-draft-area'>
            {count === 0 && phase !== 'recording' && (
              <Empty className='landing-draft-empty'>
                <EmptyHeader>
                  <EmptyMedia>
                    <CircleDashed size={28} />
                  </EmptyMedia>
                  <EmptyTitle>{t('landing.demoSection.emptyTitle')}</EmptyTitle>
                  <EmptyDescription>
                    {t('landing.demoSection.emptyText')}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
            <Accordion
              value={expanded}
              onValueChange={value => {
                setExpanded(value as string[]);
                if (value.length) setPlaying(false);
              }}
              className='landing-interview-records'
            >
              {DEMO_TURNS.slice(0, count + (phase === 'recording' ? 1 : 0)).map(
                (item, index) => {
                  const incoming = index === count;
                  const isApproved = approved.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      ref={incoming ? target : undefined}
                      className={cn(
                        'landing-draft-record',
                        isApproved && 'is-approved',
                      )}
                      style={{ visibility: incoming ? 'hidden' : 'visible' }}
                      inert={incoming}
                      aria-hidden={incoming}
                    >
                      <AccordionItem value={item.id}>
                        <AccordionTrigger>
                          <span className='landing-draft-summary'>
                            <span className='landing-knowledge-top'>
                              <code>{item.id}</code>
                              <KnowledgeStatusBadge
                                status={isApproved ? 'approved' : 'draft'}
                              />
                            </span>
                            <span className='landing-draft-title'>
                              {t(`landing.demoSection.turns.${item.key}.title`)}
                            </span>
                            <KindBadge kind={item.kind} />
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className='landing-draft-description'>
                            {t(`landing.demoSection.turns.${item.key}.text`)}
                          </p>
                          <p className='landing-draft-source'>
                            <MessageSquare size={13} aria-hidden />
                            {t('landing.demoSection.sourceQuestion', {
                              number: index + 1,
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
                                setApproved(value => [...value, item.id])
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
                },
              )}
            </Accordion>
          </div>
          <p className='landing-demo-status' role='status'>
            {t(
              complete
                ? 'landing.demoSection.complete'
                : phase === 'recording'
                  ? 'landing.demoSection.recording'
                  : count
                    ? 'landing.demoSection.reviewHint'
                    : started
                      ? 'landing.demoSection.footnote'
                      : 'landing.demoSection.emptyHint',
            )}
          </p>
        </aside>
      </CardContent>
      <CardFooter className='landing-demo-footer'>
        <span>{t('landing.demoSection.footnote')}</span>
        <Button variant='ghost' size='sm' disabled={!started} onClick={restart}>
          <RotateCcw data-icon='inline-start' />
          {t('landing.demoSection.restart')}
        </Button>
      </CardFooter>
    </Card>
  );
}
