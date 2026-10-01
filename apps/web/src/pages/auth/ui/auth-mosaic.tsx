import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeSwitch } from '@/features/switch-theme';
import { Brand } from '@/shared/ui';

import { mountAuthMosaic } from './auth-mosaic-animation';

type MosaicAnimation = ReturnType<typeof mountAuthMosaic>;

export function AuthMosaic({
  glitchTrigger,
}: {
  readonly glitchTrigger?: number;
}) {
  const { t } = useTranslation();
  const brand = t('brand');
  const panelRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLCanvasElement>(null);
  const wordRef = useRef<HTMLCanvasElement>(null);
  const wordRegionRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<MosaicAnimation | null>(null);
  const lastGlitchTriggerRef = useRef(glitchTrigger);

  useEffect(() => {
    const panel = panelRef.current;
    const fieldCanvas = fieldRef.current;
    const wordCanvas = wordRef.current;
    const wordRegion = wordRegionRef.current;
    if (!panel || !fieldCanvas || !wordCanvas || !wordRegion) return;

    const animation = mountAuthMosaic({
      panel,
      fieldCanvas,
      wordCanvas,
      wordRegion,
      word: brand,
    });
    animationRef.current = animation;
    return () => {
      animation.dispose();
      animationRef.current = null;
    };
  }, [brand]);

  useEffect(() => {
    if (glitchTrigger === lastGlitchTriggerRef.current) return;
    lastGlitchTriggerRef.current = glitchTrigger;
    if (glitchTrigger !== undefined) animationRef.current?.trigger();
  }, [glitchTrigger]);

  return (
    <aside
      ref={panelRef}
      className='dark relative flex min-h-64 overflow-hidden bg-background text-foreground lg:min-h-[calc(100svh-1rem)] lg:rounded-lg'
    >
      <canvas
        ref={fieldRef}
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 size-full'
      />
      <div
        ref={wordRegionRef}
        className='pointer-events-none absolute inset-x-3 top-[18%] bottom-[24%] lg:inset-x-5 lg:top-[16%] lg:bottom-[23%]'
      >
        <canvas ref={wordRef} aria-hidden='true' className='size-full' />
      </div>
      <div className='relative flex w-full flex-col justify-between p-6 lg:p-8'>
        <div className='flex items-start justify-between'>
          <Brand />
          <ThemeSwitch className='lg:hidden' />
        </div>
        <p className='text-sm leading-snug text-foreground/75 lg:text-2xl lg:leading-tight'>
          {t('authArtwork.line1')}
          <br />
          {t('authArtwork.line2')}
        </p>
      </div>
    </aside>
  );
}
