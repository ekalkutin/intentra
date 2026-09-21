import { Plus } from 'lucide-react';
import { useId, useState } from 'react';

import { useDict } from '@/features/language-switch';
import { cn } from '@/shared/lib/utils';
import { BandLabel } from '@/shared/ui/landing';

/* Ported accordion: a narrow centred measure, hairline dividers, and a plus in
 * a circle that rotates 45° into a close. The open/close animates
 * `grid-template-rows: 0fr -> 1fr`, which is the one way to animate an
 * unknown height without animating `height` itself.
 *
 * Added on the way over: `aria-expanded`, `aria-controls` and a labelled
 * region, so the control announces its state. The visual behaviour is
 * unchanged — this is the part of a ported component worth improving rather
 * than reproducing. */
export function FaqSection() {
  const t = useDict();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <section id='faq' className='bg-band-quiet text-band-ink'>
      <div className='mx-auto max-w-[860px] px-4 py-24 sm:px-6 sm:py-32 lg:py-40'>
        <div className='text-center'>
          <BandLabel tone='light'>{t.faq.label}</BandLabel>
          <h2 className='landing-serif mt-4 text-[2.6rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.4rem] lg:text-[4.2rem]'>
            {t.faq.headline}
          </h2>
        </div>

        <div className='divide-band-ink/10 mt-14 divide-y sm:mt-16'>
          {t.faq.items.map((item, i) => {
            const isOpen = openIndex === i;
            const panelId = `${baseId}-panel-${i}`;
            const buttonId = `${baseId}-button-${i}`;

            return (
              <div key={item.question}>
                <h3>
                  <button
                    type='button'
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className='flex w-full items-start justify-between gap-4 py-6 text-left active:translate-y-px'
                  >
                    <span className='text-title-sm sm:text-title text-band-ink leading-snug font-semibold'>
                      {item.question}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        'border-band-ink/12 text-muted-foreground mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border transition-transform duration-200 ease-out',
                        isOpen && 'rotate-45',
                      )}
                    >
                      <Plus className='size-3' />
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role='region'
                  aria-labelledby={buttonId}
                  className={cn(
                    'grid transition-[grid-template-rows] duration-200 ease-out',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className='overflow-hidden'>
                    <p className='text-body sm:text-body-lg text-muted-foreground max-w-[68ch] pr-12 pb-6 leading-[1.7]'>
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
