import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';

/** The wordmark's own size, for its aspect ratio. */
const WORDMARK = { width: 854, height: 173 } as const;

/**
 * Intentra's pixel wordmark. Now and then it breaks into bands and snaps back
 * together (`intentra-wordmark-reassemble`), never under reduced motion. The
 * width comes from the caller; the drawing is light, so it is inverted on the
 * light theme.
 */
export function Brand({ className }: { readonly className?: string }) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        'pointer-events-none block select-none invert dark:invert-0',
        className,
      )}
    >
      <img
        src='/intentra-wordmark-inverse.svg'
        alt={t('brand')}
        width={WORDMARK.width}
        height={WORDMARK.height}
        draggable={false}
        className='h-auto w-full animate-[intentra-wordmark-reassemble_12s_steps(1,end)_infinite] motion-reduce:animate-none'
      />
    </span>
  );
}
