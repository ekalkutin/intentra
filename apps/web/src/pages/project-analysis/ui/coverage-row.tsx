import { CircleCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { uncheckedCount, type AnalysisCoverage } from '@/entities/analysis-run';
import { ListRow, Progress, ProgressLabel, ProgressValue } from '@/shared/ui';

/**
 * How much of the Project's knowledge is checked: its Drafts and Approved
 * items, Open Questions aside. Its last line also tells why there is nothing
 * to start when nothing is Unchecked.
 */
export function CoverageRow({
  coverage,
  hintId,
}: {
  readonly coverage: AnalysisCoverage;
  /** The hint's id, for the start action that it explains. */
  readonly hintId: string;
}) {
  const { t } = useTranslation();
  const { checked, total } = coverage;
  const unchecked = uncheckedCount(coverage);

  if (total === 0) {
    return (
      <ListRow>
        <p className='text-sm font-medium'>{t('analysis.coverage.empty')}</p>
        <p
          id={hintId}
          className='mt-0.5 text-sm text-pretty text-muted-foreground'
        >
          {t('analysis.coverage.emptyHint')}
        </p>
      </ListRow>
    );
  }

  if (unchecked === 0) {
    return (
      <ListRow>
        <p className='flex items-center gap-1.5 text-sm font-medium'>
          <CircleCheck aria-hidden className='size-4 text-success' />
          {t('analysis.coverage.allChecked', { count: total })}
        </p>
        <p
          id={hintId}
          className='mt-0.5 text-sm text-pretty text-muted-foreground'
        >
          {t('analysis.coverage.allCheckedHint')}
        </p>
      </ListRow>
    );
  }

  return (
    <ListRow>
      <Progress value={checked} max={total} className='gap-x-3 gap-y-2'>
        <ProgressLabel>
          {t('analysis.coverage.progress', { checked, count: total })}
        </ProgressLabel>
        <ProgressValue className='font-mono text-xs leading-5' />
      </Progress>
      <p id={hintId} className='mt-2 text-sm text-pretty text-muted-foreground'>
        {t('analysis.coverage.unchecked', { count: unchecked })}
      </p>
    </ListRow>
  );
}
