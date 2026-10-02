import { TriangleAlert } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ANALYSIS_ERROR_CODES,
  useAnalysisScheduleQuery,
  useChangeAnalysisScheduleMutation,
} from '@/entities/analysis-run';
import { toApiError, type ApiError } from '@/shared/api';
import { useDescribeError } from '@/shared/i18n';
import { List, ListRow, Switch } from '@/shared/ui';

/** Failures whose own words tell this person what to do; any other gets the setting's own. */
const KNOWN_FAILURES: readonly string[] = Object.values(ANALYSIS_ERROR_CODES);

/**
 * The Project's nightly check as one setting: its switch for a Maintainer,
 * its state for everyone else, and, when it is on but cannot go ahead, why.
 */
export function NightlySchedule({
  scope,
}: {
  readonly scope: { readonly workspaceId: string; readonly projectId: string };
}) {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const id = useId();
  const { data: schedule, refetch } = useAnalysisScheduleQuery(scope);
  const [change] = useChangeAnalysisScheduleMutation();
  const [failure, setFailure] = useState<ApiError | null>(null);

  if (!schedule) {
    return null;
  }

  const { enabled } = schedule;
  const turn = async (next: boolean) => {
    setFailure(null);
    const result = await change({ ...scope, body: { enabled: next } });
    const error = toApiError(result.error);
    if (!error) {
      return;
    }
    // The change may have been kept before the answer failed: then it is no failure.
    const fresh = await refetch();
    setFailure(fresh.data?.enabled === next ? null : error);
  };

  return (
    <List>
      <ListRow>
        {/* The switch sits centred on the setting's two lines; a warning runs under both. */}
        <div className='flex items-center justify-between gap-4'>
          <div className='min-w-0'>
            <label htmlFor={id} className='block text-sm font-medium'>
              {t('analysis.schedule.title')}
            </label>
            <p
              id={`${id}-hint`}
              className='mt-0.5 text-sm text-pretty text-muted-foreground'
            >
              {enabled ? t('analysis.schedule.on') : t('analysis.schedule.off')}
              {!schedule.access.canChange && (
                <> {t('analysis.schedule.onlyMaintainer')}</>
              )}
            </p>
          </div>
          <Switch
            id={id}
            checked={enabled}
            disabled={!schedule.access.canChange}
            aria-describedby={`${id}-hint`}
            onCheckedChange={next => void turn(next)}
          />
        </div>
        {enabled && schedule.blockedBy && (
          <p className='mt-2 flex items-start gap-1.5 text-sm text-pretty'>
            <TriangleAlert
              aria-hidden
              className='mt-0.5 size-3.5 shrink-0 text-warning'
            />
            {t(`analysis.schedule.blocked.${schedule.blockedBy}`)}
          </p>
        )}
        {failure && (
          <p role='alert' className='mt-1 text-sm text-destructive'>
            {KNOWN_FAILURES.includes(failure.code)
              ? describeError(failure).text
              : t('analysis.schedule.changeFailed')}
          </p>
        )}
      </ListRow>
    </List>
  );
}
