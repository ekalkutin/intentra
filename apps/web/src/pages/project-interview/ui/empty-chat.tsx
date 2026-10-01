import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui';

const STARTERS = ['start', 'gaps', 'review'] as const;

/** A new Conversation: what it is for, and a few ways to begin. */
export function EmptyChat({
  projectName,
  onStart,
}: {
  readonly projectName: string;
  readonly onStart: (text: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className='flex min-h-[40vh] flex-col justify-end gap-6'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-2xl font-semibold tracking-[-0.02em] text-balance'>
          {projectName}
        </h2>
        <p className='text-sm text-pretty text-muted-foreground'>
          {t('interview.emptyDescription')}
        </p>
      </div>
      <div className='flex flex-wrap gap-2'>
        {STARTERS.map(starter => (
          <Button
            key={starter}
            variant='outline'
            className='h-auto py-1.5 text-left font-normal whitespace-normal'
            onClick={() => onStart(t(`interview.starters.${starter}`))}
          >
            {t(`interview.starters.${starter}`)}
          </Button>
        ))}
      </div>
    </div>
  );
}
