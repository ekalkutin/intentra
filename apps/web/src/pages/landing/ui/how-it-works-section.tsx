import { Link } from 'react-router';

import { useDict } from '@/features/language-switch';
import { BandLabel, heroButtonClassName } from '@/shared/ui/landing';

/* Ported verbatim in shape: dark band, overline, a serif headline whose second
 * line drops to 40% so the sentence turns without a second type size, then a
 * four-up grid whose dividers are a 1px grid gap over a tinted background
 * rather than borders on each cell — the borders would double at every seam.
 *
 * Four steps, not five: the grid is 2-up at `sm`, and five cells leave a lone
 * orphan on the second row. The fifth stage of the chain — impact analysis —
 * gets a full features panel instead of a cramped cell. */
export function HowItWorksSection() {
  const t = useDict();

  return (
    <section id='how-it-works' className='bg-band-deep text-white'>
      <div className='mx-auto max-w-[1320px] px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40'>
        <BandLabel tone='dark'>{t.howItWorks.label}</BandLabel>

        <h2 className='landing-serif mt-4 text-[2.6rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.4rem] lg:text-[4.2rem]'>
          {t.howItWorks.headlineMain}
          <br />
          <span className='text-white/60'>{t.howItWorks.headlineFaded}</span>
        </h2>

        <ol className='mt-20 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4'>
          {t.howItWorks.steps.map((step, i) => (
            <li
              key={step.title}
              className='bg-band-deep flex flex-col p-8 lg:p-10'
            >
              <span className='text-label font-semibold tabular-nums text-white/55'>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className='text-title mt-4 leading-snug font-semibold text-white'>
                {step.title}
              </h3>
              <p className='text-body sm:text-body-lg mt-3 leading-[1.7] text-white/60'>
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <div className='mt-14 flex flex-wrap items-center gap-4'>
          <Link to='/auth/sign-in' className={heroButtonClassName('solid')}>
            {t.howItWorks.cta}
          </Link>
          <a href='#principles' className={heroButtonClassName('ghost')}>
            {t.howItWorks.ctaSecondary}
          </a>
        </div>
      </div>
    </section>
  );
}
