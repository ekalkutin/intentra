import type { UIMessage } from 'ai';
import {
  AlertCircle,
  BookOpen,
  Brain,
  ChevronRight,
  PenLine,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  KindIcon,
  KnowledgeKeyLink,
  KnowledgeStreamingMarkdown,
} from '@/entities/knowledge-item';
import { DEFAULT_TONE, nextPhrase, useThinkingPhrases } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui';

import {
  ACTIVITIES,
  currentActivity,
  readMessage,
  specialistOf,
  type Activity,
  type Block,
  type Step,
} from '../model/message-parts';

import { ChoicesCard } from './choices-card';

const STEP_ICONS: Record<Activity, LucideIcon> = {
  thinking: Brain,
  reasoning: Brain,
  reading: BookOpen,
  writing: PenLine,
  specialist: Users,
  answering: Brain,
};

/**
 * The agent's message as a document in three parts: what it did (its work
 * folded, then the Drafts it wrote), what it says, and the question it asks
 * last; while it answers, one line says what it is doing.
 */
export function AssistantMessage({
  message,
  streaming,
  answers,
  canAnswer,
  onAnswer,
}: {
  readonly message: UIMessage;
  /** This is the answer still arriving. */
  readonly streaming: boolean;
  /** The Member's reply to each choice card, by its block id. */
  readonly answers: ReadonlyMap<string, string>;
  readonly canAnswer: boolean;
  readonly onAnswer: (text: string) => void;
}) {
  const { blocks, steps } = readMessage(message);
  const current = currentActivity(message);
  // While answering, one line says what the agent does, until its words show.
  const showStatus =
    streaming &&
    (current.activity !== ACTIVITIES.answering || blocks.length === 0);
  const receipts = blocks.filter(block => block.type === 'write');
  const texts = blocks.filter(block => block.type === 'text');
  // A question waits for the Member, so it closes the message whenever it came.
  const questions = blocks.filter(block => block.type === 'choices');
  const showLog = steps.length > 0 && !streaming;
  const view = (block: Block) => (
    <BlockView
      key={block.id}
      block={block}
      streaming={streaming && block === blocks.at(-1)}
      answer={answers.get(block.id) ?? null}
      canAnswer={canAnswer}
      onAnswer={onAnswer}
    />
  );

  return (
    <div className='flex min-w-0 flex-col gap-4'>
      {(showLog || receipts.length > 0) && (
        <div className='flex min-w-0 flex-col gap-1.5'>
          {showLog && <WorkLog steps={steps} />}
          {receipts.map(view)}
        </div>
      )}
      {texts.length > 0 && (
        <div className='flex min-w-0 flex-col gap-3'>{texts.map(view)}</div>
      )}
      {questions.length > 0 && (
        <div
          className={cn(
            'flex min-w-0 flex-col gap-6',
            (texts.length > 0 || receipts.length > 0) && 'mt-2',
          )}
        >
          {questions.map(view)}
        </div>
      )}
      {showStatus && (
        <LiveStatus
          activity={
            current.activity === ACTIVITIES.answering
              ? ACTIVITIES.thinking
              : current.activity
          }
          name={current.name}
        />
      )}
    </div>
  );
}

function BlockView({
  block,
  streaming,
  answer,
  canAnswer,
  onAnswer,
}: {
  readonly block: Block;
  readonly streaming: boolean;
  readonly answer: string | null;
  readonly canAnswer: boolean;
  readonly onAnswer: (text: string) => void;
}) {
  const { t } = useTranslation();

  if (block.type === 'text') {
    return (
      <KnowledgeStreamingMarkdown streaming={streaming}>
        {block.text}
      </KnowledgeStreamingMarkdown>
    );
  }
  if (block.type === 'choices') {
    return (
      <ChoicesCard
        choices={block.choices}
        answer={answer}
        disabled={!canAnswer}
        onAnswer={onAnswer}
      />
    );
  }
  if (block.error !== null) {
    return (
      <p className='flex items-start gap-2 text-sm text-destructive'>
        <AlertCircle aria-hidden className='mt-0.5 size-4 shrink-0' />
        <span>
          {t('interview.writeFailed')}
          {block.item && (
            <>
              {' '}
              <span className='font-mono text-xs'>{block.item.key}</span>
            </>
          )}
          {block.error && (
            <span className='block text-xs text-muted-foreground'>
              {block.error}
            </span>
          )}
        </span>
      </p>
    );
  }

  return (
    <p className='flex min-w-0 items-center gap-2 text-sm'>
      {block.item?.kind ? (
        <KindIcon kind={block.item.kind} className='size-4 shrink-0' />
      ) : (
        <PenLine
          aria-hidden
          className='size-4 shrink-0 text-muted-foreground'
        />
      )}
      <span className='shrink-0 text-muted-foreground'>
        {t(`interview.writes.${block.action}`)}
      </span>
      {block.item && <KnowledgeKeyLink itemKey={block.item.key} />}
      {block.item?.title && (
        <span className='min-w-0 truncate'>{block.item.title}</span>
      )}
    </p>
  );
}

/** How long a thinking phrase stays before another takes its place. */
const PHRASE_MS = 5000;
/** The spinner's frames and pace, as in Claude Code. */
const SPINNER_FRAMES = ['·', '✢', '✳', '✶', '✻', '✽', '✻', '✶', '✳', '✢'];
const SPINNER_MS = 120;
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** What the agent is doing now, in one shimmering line. */
function LiveStatus({
  activity,
  name,
}: {
  readonly activity: Activity;
  readonly name: string | null;
}) {
  const { t } = useTranslation();
  if (activity === ACTIVITIES.thinking || activity === ACTIVITIES.reasoning) {
    return <ThinkingStatus />;
  }
  const Icon = STEP_ICONS[activity];
  const specialist = name ? specialistOf(name) : null;

  return (
    <p
      role='status'
      className='flex items-center gap-2 text-sm text-muted-foreground'
    >
      <Icon aria-hidden className='size-4 shrink-0' />
      <span className='shimmer'>
        {t(`interview.activities.${activity}`, {
          name: specialist ? displayName(specialist) : '',
        })}
      </span>
    </p>
  );
}

/**
 * While the agent thinks: a turning glyph and a phrase in the system's tone,
 * a new one at random every few seconds.
 */
function ThinkingStatus() {
  const phrases = useThinkingPhrases(DEFAULT_TONE);
  const [phrase, setPhrase] = useState(() => nextPhrase(phrases, null));
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setPhrase(current => nextPhrase(phrases, current)),
      PHRASE_MS,
    );
    return () => clearInterval(id);
  }, [phrases]);

  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION).matches) {
      return;
    }
    const id = setInterval(
      () => setFrame(current => (current + 1) % SPINNER_FRAMES.length),
      SPINNER_MS,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <p
      role='status'
      className='flex items-center gap-2 text-sm text-muted-foreground'
    >
      <span
        aria-hidden
        className='inline-flex w-4 shrink-0 justify-center font-mono text-foreground/70'
      >
        {SPINNER_FRAMES[frame]}
      </span>
      <span className='shimmer'>{phrase}…</span>
    </p>
  );
}

/** The steps behind an answer, folded: reasoning, reads, Specialists, writes. */
function WorkLog({ steps }: { readonly steps: readonly Step[] }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className='-ml-1 flex items-center gap-1 rounded-md px-1 text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50'>
        <ChevronRight
          aria-hidden
          className={cn('size-3.5 transition-transform', open && 'rotate-90')}
        />
        {t('interview.workLog', { count: steps.length })}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ol className='mt-2 flex flex-col gap-1.5 border-l border-border pl-3'>
          {steps.map(step => (
            <StepRow key={step.id} step={step} />
          ))}
        </ol>
      </CollapsibleContent>
    </Collapsible>
  );
}

function StepRow({ step }: { readonly step: Step }) {
  const { t } = useTranslation();
  const Icon = STEP_ICONS[step.activity];
  const specialist = step.name ? specialistOf(step.name) : null;
  const label =
    step.activity === ACTIVITIES.reasoning
      ? t('interview.stepReasoning')
      : t(`interview.steps.${step.activity}`, {
          name: specialist ? displayName(specialist) : '',
        });

  return (
    <li className='flex min-w-0 flex-col gap-1 text-xs text-muted-foreground'>
      <span className='flex min-w-0 items-center gap-1.5'>
        <Icon aria-hidden className='size-3.5 shrink-0' />
        <span className='text-foreground/80'>{label}</span>
        {step.name && !specialist && (
          <span className='truncate font-mono'>{step.name}</span>
        )}
        {step.failed && (
          <span className='text-destructive'>
            · {t('interview.stepFailed')}
          </span>
        )}
      </span>
      {step.text && (
        <span className='line-clamp-6 pl-5 whitespace-pre-wrap'>
          {step.text}
        </span>
      )}
    </li>
  );
}

/** A Specialist's tool key as a name: `analyst` → `Analyst`, `ux-researcher` → `Ux researcher`. */
function displayName(key: string): string {
  const words = key.replaceAll(/[-_]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
