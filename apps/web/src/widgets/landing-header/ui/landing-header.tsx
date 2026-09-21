import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { LanguageSwitch, useDict } from '@/features/language-switch';
import { contactHref } from '@/shared/config/site';
import { cn } from '@/shared/lib/utils';
import { headerButtonClassName } from '@/shared/ui/landing';

/* Ported nav shape: the wordmark and the section links are one group on the
 * left, the actions sit on the right, the bar is 76px and floats transparently
 * over the dark hero band rather than sitting in a bordered strip of its own.
 *
 * The right side carries one action, not two — the reference pairs a GitHub
 * button with its CTA, and Intentra has no public repository to link. An
 * inert second button to keep the silhouette would be decoration. */
export function LandingHeader({
  variant = 'dark',
}: {
  variant?: 'dark' | 'light';
}) {
  const t = useDict();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '#features', label: t.header.capabilities },
    { href: '#how-it-works', label: t.header.howItWorks },
    { href: '#principles', label: t.header.principles },
    { href: '#faq', label: t.header.faq },
  ];

  /* Escape closes the sheet: a disclosure that only closes by re-tapping its
   * own trigger is a trap for keyboard users. */
  useEffect(() => {
    if (!isMenuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsMenuOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  return (
    <header
      className={cn(
        'relative inset-x-0 top-0 z-30',
        variant === 'dark'
          ? 'absolute bg-transparent'
          : 'border-band-ink/8 border-b bg-white',
      )}
    >
      <div className='mx-auto flex h-[76px] max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8'>
        <div className='flex min-w-0 items-center gap-6 lg:gap-8'>
          <a href='#top' className='flex shrink-0 items-center gap-3'>
            <Wordmark variant={variant} />
          </a>

          <nav
            aria-label={t.header.navigation}
            className='hidden items-center gap-1 md:flex'
          >
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={navLinkClassName(variant)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className='flex shrink-0 items-center gap-2 sm:gap-2.5'>
          {/* Hidden below `sm` rather than shrunk: at 320px the bar already
              carries a wordmark, a menu trigger and the primary action, and a
              fourth control there costs more than it gives. It reappears
              inside the sheet. */}
          <LanguageSwitch variant={variant} className='hidden sm:flex' />
          <button
            type='button'
            aria-label={isMenuOpen ? t.header.closeMenu : t.header.openMenu}
            aria-expanded={isMenuOpen}
            aria-controls='landing-nav-sheet'
            onClick={() => setIsMenuOpen(open => !open)}
            className={cn(
              headerButtonClassName('ghost', variant),
              'px-3 md:hidden',
            )}
          >
            {isMenuOpen ? (
              <X className='size-4' aria-hidden />
            ) : (
              <Menu className='size-4' aria-hidden />
            )}
          </button>
          <a
            href={contactHref}
            className={headerButtonClassName('solid', variant)}
          >
            {t.header.cta}
          </a>
        </div>
      </div>

      {isMenuOpen ? (
        <div
          id='landing-nav-sheet'
          className={cn(
            'absolute top-[calc(100%+8px)] right-4 left-4 z-50 rounded-(--landing-radius-menu) border p-2 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl md:hidden',
            variant === 'dark'
              ? 'border-white/14 bg-[#070a10]/95 text-white'
              : 'border-band-ink/10 text-band-ink bg-white',
          )}
        >
          <nav aria-label={t.header.navigation} className='flex flex-col'>
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={mobileNavLinkClassName(variant)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div
            className={cn(
              'mt-2 flex items-center justify-between border-t pt-2',
              variant === 'dark' ? 'border-white/10' : 'border-band-ink/8',
            )}
          >
            <LanguageSwitch variant={variant} className='px-1.5 sm:hidden' />
          </div>
        </div>
      ) : null}
    </header>
  );
}

/** The wordmark is set in the editorial serif and lowercased — the one place
 *  the display face appears at small size, which is what makes it read as a
 *  mark rather than a heading. */
function Wordmark({ variant }: { variant: 'dark' | 'light' }) {
  return (
    <span
      className={cn(
        'landing-serif text-title-lg sm:text-display-sm leading-none tracking-[-0.01em] lowercase',
        variant === 'dark' ? 'text-white/92' : 'text-band-ink',
      )}
    >
      intentra
    </span>
  );
}

function navLinkClassName(variant: 'dark' | 'light') {
  return cn(
    'landing-affordance text-label inline-flex h-9 items-center rounded-(--landing-radius-nav-item) px-3 font-medium transition-colors',
    variant === 'dark'
      ? 'text-white/72 hover:bg-white/8 hover:text-white active:text-white'
      : 'text-band-ink/62 hover:bg-band-ink/5 hover:text-band-ink active:text-band-ink',
  );
}

function mobileNavLinkClassName(variant: 'dark' | 'light') {
  return cn(
    'landing-affordance text-body flex min-h-11 items-center gap-2 rounded-(--landing-radius-menu-item) px-3 font-medium transition-colors',
    variant === 'dark'
      ? 'text-white/76 hover:bg-white/8 hover:text-white'
      : 'text-band-ink/68 hover:bg-band-ink/5 hover:text-band-ink',
  );
}
