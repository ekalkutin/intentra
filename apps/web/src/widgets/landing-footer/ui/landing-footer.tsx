import { useDict } from '@/features/language-switch';
import { contactHref } from '@/shared/config/site';

/* Ported footer: a brand column beside its link groups, a quiet legal row with
 * the language switcher, and the giant serif wordmark that closes the page.
 *
 * Two groups rather than the reference's four — Intentra is one page today,
 * and columns of links to routes that do not exist are worse than a short
 * footer. The social row is gone for the same reason.
 *
 * The wordmark is the page's signature: `clamp(6rem, 22vw, 16rem)` at 0.82
 * leading, so it fills the measure at every width and never wraps. */
export function LandingFooter() {
  const t = useDict();
  const groups = Object.values(t.footer.groups);

  return (
    <footer className='bg-band-ink text-white'>
      <div className='mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col gap-12 border-b border-white/10 py-16 sm:py-20 lg:flex-row lg:gap-20'>
          <div className='lg:w-[340px] lg:shrink-0'>
            <a href='#top' className='flex items-center gap-3'>
              <img
                src='/brand/multica-logo-dark.svg'
                alt=''
                className='size-9 shrink-0 object-contain'
              />
              <span className='landing-serif text-display-sm leading-none tracking-[-0.01em] lowercase'>
                intentra
              </span>
            </a>
            <p className='text-body sm:text-body-lg mt-4 max-w-[300px] leading-[1.7] text-white/60'>
              {t.footer.tagline}
            </p>
            <div className='mt-6'>
              <a
                href={contactHref}
                className='landing-affordance text-label text-band-ink inline-flex items-center justify-center rounded-(--landing-radius-button) bg-white px-5 py-2.5 font-semibold transition-colors hover:bg-white/88 active:translate-y-px'
              >
                {t.footer.cta}
              </a>
            </div>
          </div>

          <div className='grid flex-1 grid-cols-2 gap-8'>
            {groups.map(group => (
              <div key={group.label}>
                <h2 className='text-caption font-semibold tracking-[0.1em] text-white/60 uppercase'>
                  {group.label}
                </h2>
                <ul className='mt-4 flex flex-col gap-2.5'>
                  {group.links.map(link => (
                    <li key={link.label}>
                      <a
                        href={link.href === 'mailto' ? contactHref : link.href}
                        className='landing-affordance text-body text-white/60 transition-colors hover:text-white active:text-white'
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* The language switcher sat here in the reference. It moved to the
            header, so this row is the legal line alone. */}
        <div className='flex items-center py-6'>
          <p className='text-label text-white/55'>
            {t.footer.copyright.replace(
              '{year}',
              String(new Date().getFullYear()),
            )}
          </p>
        </div>

        <div className='relative overflow-hidden pb-4'>
          <span
            aria-hidden
            className='landing-serif block text-[clamp(6rem,22vw,16rem)] leading-[0.82] font-normal tracking-[-0.04em] text-white lowercase'
          >
            intentra
          </span>
        </div>
      </div>
    </footer>
  );
}
