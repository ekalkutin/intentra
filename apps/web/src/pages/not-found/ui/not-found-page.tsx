import { Link } from 'react-router';

import { useDict } from '@/features/language-switch';
import { LandingHeader } from '@/widgets/landing-header';

export function NotFoundPage() {
  const t = useDict();

  return (
    <div className='bg-band-deep min-h-dvh text-white'>
      <LandingHeader />
      <section className='mx-auto max-w-[1320px] px-4 pt-40 pb-40 sm:px-6 lg:px-8'>
        <p className='text-micro font-semibold tracking-[0.16em] text-white/60 tabular-nums'>
          {t.notFound.code}
        </p>
        <h1 className='landing-serif mt-4 max-w-[16ch] text-[2.6rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.4rem] lg:text-[4.2rem]'>
          {t.notFound.headline}
        </h1>
        <p className='text-body-lg sm:text-title-sm mt-6 max-w-[52ch] leading-7 text-white/60'>
          {t.notFound.description}
        </p>
        <Link
          to='/'
          className='landing-affordance text-body mt-10 inline-block font-semibold text-white underline decoration-white/30 underline-offset-[6px] transition-colors hover:decoration-white active:translate-y-px'
        >
          {t.notFound.cta}
        </Link>
      </section>
    </div>
  );
}
