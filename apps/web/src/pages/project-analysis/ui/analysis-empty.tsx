import { SearchCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui';

/** A Project that was never checked: one line on what a check finds, and the action to start it for whoever may. */
export function AnalysisEmpty({ action }: { readonly action: ReactNode }) {
  const { t } = useTranslation();

  return (
    <Empty className='gap-7 border border-dashed border-border px-6 py-20'>
      <EmptyHeader className='gap-2'>
        <EmptyMedia className='mb-3'>
          {/* The mark in two quiet rings, the outer one fainter. */}
          <span className='flex size-[4.5rem] items-center justify-center rounded-full border border-border/50'>
            <span className='flex size-12 items-center justify-center rounded-full border border-border bg-muted text-foreground'>
              <SearchCheck className='size-5' />
            </span>
          </span>
        </EmptyMedia>
        <EmptyTitle className='text-lg font-semibold tracking-[-0.015em]'>
          {t('analysis.emptyTitle')}
        </EmptyTitle>
        <EmptyDescription>{t('analysis.emptyDescription')}</EmptyDescription>
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}
