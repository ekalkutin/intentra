import { useEffect, useRef, useState } from 'react';

import { useDict } from '@/features/language-switch';
import { cn } from '@/shared/lib/utils';

/* The features band, ported from the reference: a sticky rail on the left
 * tracking which panel is in view, panels scrolling past it on the right.
 *
 * One departure — the reference gives each panel a product visual above its
 * cards. Four empty placeholders down one band would read as an unfinished
 * page rather than an honest one, so the panels are typographic here and the
 * single held-open visual slot stays in the hero, where it is legible as a
 * deliberate gap. */
export function FeaturesSection() {
  const t = useDict();
  const panels = t.features.panels;
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!Number.isNaN(index)) setActiveIndex(index);
          }
        }
      },
      /* The band is read, not scrubbed: firing when a panel crosses the upper
       * third keeps the rail in step with what the eye is on, instead of
       * flipping every time a boundary touches the viewport edge. */
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    );

    for (const el of panelRefs.current) {
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  function scrollToPanel(index: number) {
    panelRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  return (
    <section id='features' className='text-band-ink bg-white'>
      <div className='mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8'>
        <div className='relative lg:flex lg:gap-20'>
          <nav
            aria-label={t.header.capabilities}
            className='hidden lg:block lg:w-[180px] lg:shrink-0'
          >
            <div className='sticky top-28 flex flex-col py-28'>
              {panels.map((panel, i) => (
                <button
                  type='button'
                  key={panel.label}
                  aria-current={i === activeIndex ? 'true' : undefined}
                  onClick={() => scrollToPanel(i)}
                  className={cn(
                    'landing-affordance text-micro flex items-center gap-3 rounded-lg px-4 py-3 text-left font-semibold tracking-[0.12em] transition-colors',
                    i === activeIndex
                      ? 'text-band-ink'
                      : 'text-muted-foreground hover:text-band-ink active:text-band-ink',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'size-2 shrink-0 rounded-full transition-colors',
                      i === activeIndex ? 'bg-band-ink' : 'bg-transparent',
                    )}
                  />
                  {panel.label}
                </button>
              ))}
            </div>
          </nav>

          <div className='flex-1'>
            {panels.map((panel, i) => (
              <div
                key={panel.label}
                ref={el => {
                  panelRefs.current[i] = el;
                }}
                data-index={i}
                className={cn(
                  'py-20 lg:py-28',
                  i < panels.length - 1 && 'border-band-ink/8 border-b',
                )}
              >
                {/* The label repeats the rail entry for anyone who cannot see
                    the rail — it is hidden from large screens, not from the
                    document. */}
                <p className='text-micro text-muted-foreground font-semibold tracking-[0.16em] uppercase lg:hidden'>
                  {panel.label}
                </p>

                <h2 className='landing-serif text-band-ink mt-4 text-[2.6rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.4rem] lg:mt-0 lg:text-[4.2rem]'>
                  {panel.title}
                </h2>

                <p className='text-body-lg sm:text-title-sm text-muted-foreground mt-5 max-w-[640px] leading-7'>
                  {panel.description}
                </p>

                <div className='mt-14 grid gap-8 sm:mt-16 md:grid-cols-3 md:gap-10'>
                  {panel.cards.map(card => (
                    <div key={card.title}>
                      <h3 className='text-body-lg sm:text-title-sm text-band-ink leading-snug font-semibold'>
                        {card.title}
                      </h3>
                      <p className='text-body sm:text-body-lg text-muted-foreground mt-2.5 leading-[1.7]'>
                        {card.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
