import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { KnowledgeKeyLink } from '@/entities/knowledge-item';
import { useFormatMoment } from '@/shared/i18n';
import { ListRow, StatusBadge } from '@/shared/ui';
import {
  AnalysisRunStatusDtoSchema,
  type AnalysisRunDto,
  type AnalysisRunStatusDto,
} from '@intentra/contracts/workspace';

const { running, completed, failed } = AnalysisRunStatusDtoSchema.enum;

/** How each status shows. */
const STATUSES = {
  [running]: 'pending',
  [completed]: 'done',
  [failed]: 'declined',
} as const satisfies Record<AnalysisRunStatusDto, unknown>;

/**
 * One run: when and by whom it was started, its status, and what came of it:
 * the Open Questions it recorded, or why it failed.
 */
export function RunRow({
  run,
  nameOf,
}: {
  readonly run: AnalysisRunDto;
  readonly nameOf: (memberId: string) => string | undefined;
}) {
  const { t } = useTranslation();
  const formatMoment = useFormatMoment();
  const who =
    run.startedBy === null
      ? t('analysis.bySchedule')
      : (nameOf(run.startedBy) ?? '—');

  return (
    <ListRow
      meta={
        <StatusBadge status={STATUSES[run.status]}>
          {t(`analysis.statuses.${run.status}`)}
        </StatusBadge>
      }
    >
      <p className='text-sm font-medium'>
        {formatMoment(run.startedAt)}
        <span className='font-normal text-muted-foreground'> · {who}</span>
      </p>
      <p className='mt-1 text-sm text-pretty text-muted-foreground'>
        <Outcome run={run} />
      </p>
    </ListRow>
  );
}

function Outcome({ run }: { readonly run: AnalysisRunDto }) {
  const { t } = useTranslation();
  const found = run.questionKeys.length;
  const questions = run.questionKeys.map((key, index) => (
    <Fragment key={key}>
      {index > 0 && ', '}
      <KnowledgeKeyLink itemKey={key} />
    </Fragment>
  ));

  if (run.status === running) {
    return t('analysis.runningHint');
  }
  if (run.status === failed) {
    return (
      <>
        {t(`analysis.failures.${run.failure ?? 'auditor-failed'}`)}
        {found > 0 && (
          <>
            {' '}
            {t('analysis.foundBeforeFailing', { count: found })} {questions}
          </>
        )}
      </>
    );
  }

  return (
    <>
      {found === 0 ? (
        t('analysis.foundNothing')
      ) : (
        <>
          {t('analysis.found', { count: found })} {questions}
        </>
      )}
      {run.stepLimitReached && <> {t('analysis.stepLimitReached')}</>}
    </>
  );
}
