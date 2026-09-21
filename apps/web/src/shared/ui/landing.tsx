import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

/* The landing kit, ported from the reference system's `shared.tsx`.
 *
 * The two button helpers are functions rather than components on purpose: the
 * landing renders its controls as `<a>`, `<button>` and router `<Link>`
 * depending on the destination, and a wrapper component would have to re-expose
 * all three. A classname string composes with any of them. */

export function headerButtonClassName(
  tone: 'ghost' | 'solid',
  variant: 'dark' | 'light' = 'dark',
) {
  return cn(
    'landing-affordance inline-flex items-center justify-center gap-2 rounded-(--landing-radius-button) px-4 py-2.5 text-label font-semibold transition-colors',
    variant === 'dark'
      ? tone === 'solid'
        ? 'bg-white text-band-ink hover:bg-white/92 active:translate-y-px'
        : 'border border-white/18 bg-black/16 text-white backdrop-blur-sm hover:bg-black/24 active:translate-y-px'
      : tone === 'solid'
        ? 'bg-band-ink text-white hover:bg-band-ink/88 active:translate-y-px'
        : 'border-band-ink/12 text-band-ink hover:bg-band-ink/5 border bg-white active:translate-y-px',
  );
}

export function heroButtonClassName(tone: 'ghost' | 'solid') {
  return cn(
    'landing-affordance inline-flex items-center justify-center gap-2 rounded-(--landing-radius-action) px-5 py-3 text-body font-semibold transition-colors',
    tone === 'solid'
      ? 'bg-white text-band-ink hover:bg-white/92 active:translate-y-px'
      : 'border border-white/18 bg-black/16 text-white backdrop-blur-sm hover:bg-black/24 active:translate-y-px',
  );
}

/** The overline that opens most bands. One per band, never beside its heading —
 *  the label sits directly above, in the same column. */
export function BandLabel({
  children,
  tone,
}: {
  children: ReactNode;
  tone: 'dark' | 'light';
}) {
  return (
    <p
      className={cn(
        'text-micro font-semibold tracking-[0.16em] uppercase',
        tone === 'dark' ? 'text-white/60' : 'text-muted-foreground',
      )}
    >
      {children}
    </p>
  );
}
