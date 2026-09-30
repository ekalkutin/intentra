import { useTranslation } from 'react-i18next';

import { Button } from '../primitives/button';

/** A part of the page that did not load, with the way to try again. */
export function LoadError({
  text,
  onRetry,
}: {
  readonly text: string;
  readonly onRetry: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      role='alert'
      className='flex flex-wrap items-center gap-x-4 gap-y-2 text-sm'
    >
      <span className='text-destructive'>
        {t('common.loadFailed')}: {text}
      </span>
      <Button variant='outline' size='sm' onClick={onRetry}>
        {t('common.retry')}
      </Button>
    </div>
  );
}
