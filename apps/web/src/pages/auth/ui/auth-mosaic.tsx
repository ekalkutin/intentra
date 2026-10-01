import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeSwitch } from '@/features/switch-theme';
import { Brand } from '@/shared/ui';

import { mountAuthMosaic } from './auth-mosaic-animation';
import { LanguageSwitch } from './language-switch';

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
      className='dark @container relative flex min-h-44 overflow-hidden bg-(--panel) text-foreground [--panel:var(--background)] dark:[--panel:var(--muted)]'
    >
      <canvas
        ref={fieldRef}
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 size-full'
      />
      <div
        ref={wordRegionRef}
        className='pointer-events-none absolute inset-x-3 top-[20%] bottom-[20%] lg:inset-x-5 lg:top-[16%] lg:bottom-[23%]'
      >
        <canvas ref={wordRef} aria-hidden='true' className='size-full' />
      </div>
      {/* Fades the field out under the slogan so the text sits on a calm ground. */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 bottom-0 hidden h-[40%] lg:block bg-linear-to-t from-(--panel) from-25% to-transparent'
      />
      <div className='relative flex w-full flex-col justify-between p-6 lg:p-8 lg:pb-10'>
        {/* Below lg the dotted word is the brand; the mark would only repeat it. */}
        <div className='flex items-center justify-end lg:justify-start'>
          <Brand className='hidden lg:inline-flex' />
          <div className='flex gap-1 lg:hidden'>
            <LanguageSwitch />
            <ThemeSwitch />
          </div>
        </div>
        {/* Wide screens only. The set-up light and muted, the answer heavy and bright; sized by the panel, not the viewport. */}
        <p className='hidden lg:block lg:text-[clamp(1.5rem,5cqi,2.5rem)] lg:leading-[1.1] lg:tracking-[-0.035em]'>
          <span className='block font-normal text-foreground/75'>
            {t('authArtwork.line1')}
          </span>
          <span className='block font-semibold text-foreground'>
            {t('authArtwork.line2')}
          </span>
        </p>
      </div>
    </aside>
  );
}
