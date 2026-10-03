import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, ListRow, Spinner } from '@/shared/ui';

/**
 * A Maintainer's way to have every item read again, checked or not, such as
 * after the Agents or their models changed: a quiet setting-like row, never
 * the page's main action.
 */
export function WholeProjectRow({
  busy,
  disabled,
  onStart,
}: {
  readonly busy: boolean;
  readonly disabled: boolean;
  readonly onStart: () => void;
}) {
  const { t } = useTranslation();
  const id = useId();

  return (
    <ListRow
      actions={
        <Button
          variant='outline'
          size='sm'
          disabled={disabled}
          aria-describedby={`${id}-hint`}
          onClick={onStart}
        >
          {busy && <Spinner />}
          {t('analysis.wholeProject.start')}
        </Button>
      }
    >
      <p className='text-sm font-medium'>{t('analysis.wholeProject.title')}</p>
      <p
        id={`${id}-hint`}
        className='mt-0.5 text-sm text-pretty text-muted-foreground'
      >
        {t('analysis.wholeProject.hint')}
      </p>
    </ListRow>
  );
}
