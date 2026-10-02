import { useTranslation } from 'react-i18next';

import { useFormatMoment } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { AgentSpark, ListRow, StatusBadge } from '@/shared/ui';
import {
  AnalysisRunScopeDtoSchema,
  AnalysisRunStatusDtoSchema,
  type AnalysisRunDto,
  type AnalysisRunStatusDto,
  type KnowledgeItemDto,
} from '@intentra/contracts/workspace';

import { findingsOf, waitingCount, type Finding } from '../model/findings';

import { FindingsList } from './findings-list';

const { running, completed, failed } = AnalysisRunStatusDtoSchema.enum;

/** How each finished status shows; a running run shows Intentra at work instead. */
const STATUSES = {
  [completed]: 'done',
  [failed]: 'declined',
} as const satisfies Record<Exclude<AnalysisRunStatusDto, 'running'>, unknown>;

/**
 * One run: when and by whom it was started, its status, and what came of it:
 * the Open Questions it recorded, each with what it asks, or why it failed.
 */
export function RunRow({
  run,
  nameOf,
  questions,
  entering = false,
}: {
  readonly run: AnalysisRunDto;
  /** A run that appeared while the page was open: it opens up into the list rather than appearing at once. */
  readonly entering?: boolean;
  readonly nameOf: (memberId: string) => string | undefined;
  /** The Project's Open Questions, for what each finding asks. */
  readonly questions: readonly KnowledgeItemDto[];
}) {
  const { t } = useTranslation();
  const formatMoment = useFormatMoment();
  const who =
    run.startedBy === null
      ? t('analysis.bySchedule')
      : (nameOf(run.startedBy) ?? '—');

  const isRunning = run.status === running;
  const findings = findingsOf(run.questionKeys, questions);

  return (
    <ListRow
      className={cn(
        'relative overflow-hidden',
        isRunning && 'bg-brand/[0.035] dark:bg-brand/[0.06]',
        // Grows from nothing to its height, the rows below easing down, as it fades in.
        entering &&
          '[interpolate-size:allow-keywords] transition-[height,padding,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none starting:h-0 starting:py-0 starting:opacity-0',
      )}
    >
      {isRunning && (
        // A band of light passes over the row while Intentra reads, as if scanning it.
        <span
          aria-hidden
          className='pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full animate-[analysis-scan_3.2s_cubic-bezier(0.45,0,0.25,1)_infinite] bg-linear-to-r from-transparent via-brand/20 to-transparent motion-reduce:hidden'
        />
      )}
      {/* The status sits centred on the row's two lines, whatever their length; under them where narrow. */}
      <div className='relative flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4'>
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-medium'>
            {formatMoment(run.startedAt)}
            <span className='font-normal text-muted-foreground'> · {who}</span>
            {run.scope === AnalysisRunScopeDtoSchema.enum.changes && (
              <span className='font-normal text-muted-foreground'>
                {' · '}
                {t('analysis.changesScope', { count: run.changedKeys.length })}
              </span>
            )}
          </p>
          <p
            className={cn(
              'mt-1 text-sm text-pretty',
              isRunning ? 'text-foreground/75' : 'text-muted-foreground',
            )}
          >
            <Outcome run={run} findings={findings} />
          </p>
        </div>
        {run.status === running ? (
          <RunningBadge />
        ) : (
          <StatusBadge status={STATUSES[run.status]} className='shrink-0'>
            {t(`analysis.statuses.${run.status}`)}
          </StatusBadge>
        )}
      </div>
      {findings.length > 0 && <FindingsList findings={findings} />}
    </ListRow>
  );
}

/** Intentra at work: its turning mark in the brand's ink, as in the interview. */
function RunningBadge() {
  const { t } = useTranslation();

  return (
    <span
      role='status'
      className='inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border border-brand/30 bg-background/70 pr-2.5 pl-2 text-xs font-medium text-brand shadow-[0_1px_2px_oklch(0.6_0.13_278/0.12)] backdrop-blur-sm'
    >
      <AgentSpark active className='text-[0.9375rem]' />
      {t('analysis.statuses.running')}
    </span>
  );
}

/** What came of the run, in one line. */
function Outcome({
  run,
  findings,
}: {
  readonly run: AnalysisRunDto;
  readonly findings: readonly Finding[];
}) {
  const { t } = useTranslation();
  const found = findings.length;
  const waiting = waitingCount(findings);
  const tally = found > 0 && (
    <>
      {run.status === failed
        ? t('analysis.foundBeforeFailing', { count: found })
        : t('analysis.found', { count: found })}
      <span className='text-muted-foreground'>
        {' · '}
        {found === 1
          ? waiting === 1
            ? t('analysis.oneWaiting')
            : t('analysis.oneSettled')
          : waiting === 0
            ? t('analysis.allSettled')
            : waiting === found
              ? t('analysis.allWaiting')
              : t('analysis.waiting', { count: waiting })}
      </span>
    </>
  );

  if (run.status === running) {
    return t('analysis.runningHint');
  }
  if (run.status === failed) {
    return (
      <>
        {t(`analysis.failures.${run.failure ?? 'auditor-failed'}`)}
        {tally && <> {tally}</>}
      </>
    );
  }

  return (
    <>
      {found === 0 ? t('analysis.foundNothing') : tally}
      {run.stepLimitReached && <> {t('analysis.stepLimitReached')}</>}
    </>
  );
}
