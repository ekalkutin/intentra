import {
  ArrowRight,
  FilePen,
  MessageSquarePlus,
  ScanSearch,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { KindIcon, useKnowledgeSummaryQuery } from '@/entities/knowledge-item';
import { cn } from '@/shared/lib';
import { Skeleton } from '@/shared/ui';
import type {
  KnowledgeKindDto,
  KnowledgeKindSummaryDto,
} from '@intentra/contracts/workspace';

import {
  knownOf,
  STARTER_REASONS,
  startersOf,
  type Starter,
} from '../model/starters';

/** How far apart the Kinds of the map come in, one after another. */
const REVEAL_STEP_MS = 35;
const KIND_COUNT = 11;
/** The icon of a starter that is about no one Kind. */
const STARTER_ICONS: Partial<Record<Starter['reason'], LucideIcon>> = {
  fresh: MessageSquarePlus,
  needsReview: TriangleAlert,
  drafts: FilePen,
  gaps: ScanSearch,
};
/** Starters offered when the Project's summary did not load. */
const FALLBACK_STARTERS: readonly Starter[] = [
  { reason: STARTER_REASONS.fresh, kind: null, count: 0 },
  { reason: STARTER_REASONS.gaps, kind: null, count: 0 },
];

/**
 * A new Conversation: the Project's name, what the agent already knows of it
 * Kind by Kind, and the ways to begin that matter most now. A Kind or a
 * starter clicked becomes the first message.
 */
export function EmptyChat({
  workspaceId,
  projectId,
  projectName,
  onStart,
}: {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly onStart: (text: string) => void;
}) {
  const { t } = useTranslation();
  const { data, isLoading } = useKnowledgeSummaryQuery({
    workspaceId,
    projectId,
  });
  const kinds = data?.kinds ?? null;
  const starters = kinds
    ? startersOf(kinds, data?.gaps ?? 0)
    : FALLBACK_STARTERS;

  // About a Kind, in the words of its description, lowered to run on.
  const aboutOf = (kind: KnowledgeKindDto) => {
    const about = t(`kindDescriptions.${kind}`);
    return about.charAt(0).toLowerCase() + about.slice(1);
  };
  const openKind = (entry: KnowledgeKindSummaryDto) => {
    const known = knownOf(entry);
    const values = {
      kind: t(`kinds.${entry.kind}`),
      about: aboutOf(entry.kind),
    };
    onStart(
      known === 0
        ? t('interview.openings.fill', values)
        : t('interview.openings.add', { ...values, count: known }),
    );
  };
  const openStarter = (starter: Starter) => {
    if (starter.reason === STARTER_REASONS.empty && starter.kind) {
      onStart(
        t('interview.openings.fill', {
          kind: t(`kinds.${starter.kind}`),
          about: aboutOf(starter.kind),
        }),
      );
      return;
    }
    if (starter.reason === STARTER_REASONS.gaps && starter.count > 0) {
      onStart(t('interview.openings.gapsFound'));
      return;
    }
    if (starter.reason !== STARTER_REASONS.empty) {
      onStart(t(`interview.openings.${starter.reason}`));
    }
  };

  return (
    <div className='flex min-h-[40vh] flex-col justify-end gap-10'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-2xl font-semibold tracking-[-0.02em] text-balance'>
          {projectName}
        </h2>
        <p className='max-w-xl text-sm text-pretty text-muted-foreground'>
          {t('interview.emptyDescription')}
        </p>
      </div>

      {(isLoading || kinds) && (
        <section className='flex flex-col gap-3'>
          <h3 className='text-sm font-semibold'>{t('interview.known')}</h3>
          <ul className='-mx-2 grid grid-cols-1 gap-x-4 gap-y-0.5 sm:grid-cols-2 md:grid-cols-3'>
            {kinds
              ? kinds.map((entry, index) => (
                  <li
                    key={entry.kind}
                    className='animate-in duration-500 ease-out fill-mode-both fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none'
                    style={
                      {
                        animationDelay: `${index * REVEAL_STEP_MS}ms`,
                      } as CSSProperties
                    }
                  >
                    <KindCell entry={entry} onOpen={() => openKind(entry)} />
                  </li>
                ))
              : Array.from({ length: KIND_COUNT }, (_, index) => (
                  <li key={index} className='px-2 py-1.5'>
                    <Skeleton className='h-5 w-full' />
                  </li>
                ))}
          </ul>
        </section>
      )}

      <section className='flex flex-col gap-3'>
        <h3 className='text-sm font-semibold'>{t('interview.beginWith')}</h3>
        <ul className='flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-card'>
          {starters.map(starter => (
            <li key={`${starter.reason}-${starter.kind ?? ''}`}>
              <StarterRow
                starter={starter}
                onOpen={() => openStarter(starter)}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/** One Kind on the map: its icon and name, then Approved and, after a plus, Drafts. */
function KindCell({
  entry,
  onOpen,
}: {
  readonly entry: KnowledgeKindSummaryDto;
  readonly onOpen: () => void;
}) {
  const { t } = useTranslation();
  const { approved, draft } = entry.statuses;
  const empty = knownOf(entry) === 0;
  const name = t(`kinds.${entry.kind}`);

  return (
    <button
      type='button'
      onClick={onOpen}
      aria-label={t('interview.knownLabel', {
        kind: name,
        approved,
        drafts: draft,
      })}
      className='group/kind flex h-8 w-full min-w-0 items-center gap-2.5 rounded-md px-2 text-left text-sm transition-colors outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50'
    >
      <KindIcon
        kind={entry.kind}
        className={cn(
          'size-4 shrink-0 transition-colors',
          empty &&
            'text-muted-foreground/40 group-hover/kind:text-muted-foreground',
        )}
      />
      <span
        className={cn(
          'min-w-0 flex-1 truncate',
          empty && 'text-muted-foreground',
        )}
      >
        {name}
      </span>
      <span
        aria-hidden
        className='flex shrink-0 items-baseline gap-1 font-mono text-xs tabular-nums'
      >
        {empty ? (
          <span className='text-muted-foreground/60'>—</span>
        ) : (
          <>
            <span>{approved}</span>
            {draft > 0 && (
              <span className='text-muted-foreground'>+{draft}</span>
            )}
          </>
        )}
      </span>
    </button>
  );
}

/** What a starter says: a count, a Kind's name, or plain words. */
function useStarterLabel(): (starter: Starter) => string {
  const { t } = useTranslation();

  return starter => {
    switch (starter.reason) {
      case STARTER_REASONS.needsReview:
      case STARTER_REASONS.drafts:
      case STARTER_REASONS.openQuestions:
        return t(`interview.starters.${starter.reason}`, {
          count: starter.count,
        });
      case STARTER_REASONS.gaps:
        return starter.count > 0
          ? t('interview.starters.gapsFound', { count: starter.count })
          : t('interview.starters.gaps');
      case STARTER_REASONS.empty:
        return t('interview.starters.empty', {
          kind: starter.kind ? t(`kinds.${starter.kind}`) : '',
        });
      default:
        return t(`interview.starters.${starter.reason}`);
    }
  };
}

/** One way to begin: what it is about, and the action it starts. */
function StarterRow({
  starter,
  onOpen,
}: {
  readonly starter: Starter;
  readonly onOpen: () => void;
}) {
  const { t } = useTranslation();
  const labelOf = useStarterLabel();
  const Icon = STARTER_ICONS[starter.reason];
  const label = labelOf(starter);

  return (
    <button
      type='button'
      onClick={onOpen}
      className='group/starter flex min-h-11 w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors outline-none hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset'
    >
      {starter.kind ? (
        <KindIcon kind={starter.kind} className='size-4 shrink-0' />
      ) : Icon ? (
        <Icon
          aria-hidden
          className={cn(
            'size-4 shrink-0 text-muted-foreground',
            starter.reason === STARTER_REASONS.needsReview && 'text-warning',
          )}
        />
      ) : null}
      <span className='min-w-0 flex-1 text-pretty'>{label}</span>
      <span className='flex shrink-0 items-center gap-1.5 text-muted-foreground transition-colors group-hover/starter:text-foreground'>
        {t(`interview.starterActions.${starter.reason}`)}
        <ArrowRight
          aria-hidden
          className='size-3.5 transition-transform group-hover/starter:translate-x-0.5'
        />
      </span>
    </button>
  );
}
