import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';

/** Intentra's placeholder mark and name, until there is a real logo. */
export function Brand({ className }: { readonly className?: string }) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-sm font-semibold',
        className,
      )}
    >
      <span
        aria-hidden
        className='flex size-6 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground'
      >
        {t('brand').charAt(0)}
      </span>
      {t('brand')}
    </span>
  );
}
