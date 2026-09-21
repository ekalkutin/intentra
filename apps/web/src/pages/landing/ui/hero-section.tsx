import { ArrowRight, ImageIcon } from 'lucide-react';
import type { CSSProperties } from 'react';

import { useDict } from '@/features/language-switch';
import { contactHref } from '@/shared/config/site';
import { heroButtonClassName } from '@/shared/ui/landing';
import { LandingHeader } from '@/widgets/landing-header';

/* The hero band, ported from the reference.
 *
 * Two deliberate departures. The reference sits its headline on a full-bleed
 * painted backdrop, which is where its `drop-shadow` on the h1, its `white/84`
 * subhead and its `backdrop-blur` ghost buttons come from — all of that is
 * legibility engineering over a busy image. Intentra has no such artwork, so
 * the band is a solid ink and the drop-shadow is gone: keeping it would be
 * copying a fix for a problem this page does not have.
 *
 * Second, the reference closes the fold with a row of integration logos.
 * Intentra integrates with nothing yet, so a logo wall would be invented
 * proof. The chain the product is actually about takes the slot instead. */
export function HeroSection() {
  const t = useDict();

  return (
    <div
      id='top'
      className='bg-band-deep relative min-h-full overflow-hidden text-white'
    >
      <LandingHeader />

      <section className='mx-auto max-w-[1320px] px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8 lg:pt-36 lg:pb-24'>
        <div className='mx-auto max-w-[1120px] text-center'>
          <h1
            style={{ '--i': 0 } as CSSProperties}
            className='landing-reveal landing-serif text-[3.65rem] leading-[0.93] tracking-[-0.038em] text-white sm:text-[4.85rem] lg:text-[6.4rem]'
          >
            {t.hero.headlineLine1}
            <br />
            {t.hero.headlineLine2}
          </h1>

          <p
            style={{ '--i': 1 } as CSSProperties}
            className='landing-reveal text-body-lg sm:text-title mx-auto mt-7 max-w-[820px] leading-7 text-white/84'
          >
            {t.hero.subheading}
          </p>

          <div
            style={{ '--i': 2 } as CSSProperties}
            className='landing-reveal mt-8 flex flex-wrap items-center justify-center gap-3'
          >
            <a href={contactHref} className={heroButtonClassName('solid')}>
              {t.hero.cta}
            </a>
            <a href='#how-it-works' className={heroButtonClassName('ghost')}>
              {t.hero.ctaSecondary}
            </a>
            <a
              href='#features'
              className='landing-affordance text-body group inline-flex items-center justify-center gap-1.5 rounded-(--landing-radius-action) px-3 py-3 font-semibold text-white/80 transition-colors hover:text-white'
            >
              {t.hero.ctaTertiary}
              <ArrowRight
                className='size-4 transition-transform group-hover:translate-x-0.5'
                aria-hidden
              />
            </a>
          </div>
        </div>

        <ChainRow label={t.hero.chainLabel} steps={t.hero.chain} />

        <div id='preview' className='mt-10 sm:mt-12'>
          <ProductPlaceholder
            label={t.hero.visualPending}
            note={t.hero.visualNote}
          />
        </div>
      </section>
    </div>
  );
}

/** Takes the slot the reference gives its integration logos.
 *
 * Explicit column counts, not free wrapping: six items under `flex-wrap` break
 * 4 + 2 and then 5 + 1 as the viewport narrows, and a single orphan on the
 * second row reads as a bug rather than a layout. Three columns — an exact
 * 3 x 2 — until there is room for one row of six. */
function ChainRow({ label, steps }: { label: string; steps: string[] }) {
  return (
    <div
      style={{ '--i': 3 } as CSSProperties}
      className='landing-reveal mt-12 flex flex-col items-center gap-6'
    >
      <p className='text-body text-white/60'>{label}</p>

      <ol className='grid w-full max-w-[420px] grid-cols-3 items-center justify-items-center gap-y-5 sm:max-w-[560px] lg:max-w-[980px] lg:grid-cols-6'>
        {steps.map((step, i) => (
          <li key={step} className='flex items-center gap-3'>
            <span className='text-label font-medium tracking-[0.02em] text-white/70'>
              {step}
            </span>
            {i < steps.length - 1 ? (
              <ArrowRight
                aria-hidden
                className='hidden size-3.5 text-white/35 lg:block'
              />
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** The reference ships a real screenshot here, with a hairline border and no
 *  drawn browser chrome. Intentra has no product to photograph yet, so the
 *  slot is held open and says so — the reference's own empty state for a
 *  missing visual, reused rather than reinvented. Drawing a fake app window
 *  would be the one thing this page must not do. */
function ProductPlaceholder({ label, note }: { label: string; note: string }) {
  return (
    <figure
      style={{ '--i': 4 } as CSSProperties}
      className='landing-reveal relative m-0 overflow-hidden border border-white/14'
    >
      <div className='aspect-[16/9] w-full' />
      <div className='absolute inset-0 flex items-center justify-center px-6'>
        <figcaption className='flex flex-col items-center gap-4 text-center'>
          <span className='grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/5'>
            <ImageIcon className='size-6 text-white/45' aria-hidden />
          </span>
          <span className='text-label text-white/55'>{label}</span>
          <span className='text-caption max-w-[38ch] text-white/55'>
            {note}
          </span>
        </figcaption>
      </div>
    </figure>
  );
}
