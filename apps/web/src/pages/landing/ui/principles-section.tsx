import { Link } from 'react-router';

import { useDict } from '@/features/language-switch';
import { BandLabel } from '@/shared/ui/landing';

/* The reference's two-column band: a narrow left column carrying the overline,
 * headline and one action, and a hairline highlight grid filling the rest.
 * Same `gap-px` divider technique as the band above it, inverted to light. */
export function PrinciplesSection() {
  const t = useDict();

  return (
    <section id='principles' className='text-band-ink bg-white'>
      <div className='mx-auto max-w-[1320px] px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40'>
        <div className='flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-24'>
          <div className='lg:w-[480px] lg:shrink-0'>
            <BandLabel tone='light'>{t.principles.label}</BandLabel>

            <h2 className='landing-serif mt-4 text-[2.6rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.4rem] lg:text-[4.2rem]'>
              {t.principles.headlineLine1}
              <br />
              {t.principles.headlineLine2}
            </h2>

            <p className='text-body-lg sm:text-title-sm text-muted-foreground mt-6 max-w-[420px] leading-7'>
              {t.principles.description}
            </p>

            <div className='mt-8 flex flex-wrap items-center gap-3'>
              <Link
                to='/auth/sign-in'
                className='landing-affordance text-body bg-band-ink hover:bg-band-ink/88 inline-flex items-center justify-center gap-2.5 rounded-(--landing-radius-action) px-5 py-3 font-semibold text-white transition-colors active:translate-y-px'
              >
                {t.principles.cta}
              </Link>
            </div>
          </div>

          <div className='flex-1'>
            <dl className='border-band-ink/8 bg-band-ink/8 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2'>
              {t.principles.highlights.map(item => (
                <div key={item.title} className='bg-white p-8 lg:p-10'>
                  <dt className='text-title text-band-ink leading-snug font-semibold'>
                    {item.title}
                  </dt>
                  <dd className='text-body sm:text-body-lg text-muted-foreground mt-3 leading-[1.7]'>
                    {item.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
