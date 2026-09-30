import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Intentra's mark and name. */
export function Brand() {
  const { t } = useTranslation();

  return (
    <div className='flex items-center justify-center gap-2'>
      <div className='flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
        <Sparkles className='size-5' />
      </div>
      <span className='text-xl font-semibold tracking-tight'>{t('brand')}</span>
    </div>
  );
}
