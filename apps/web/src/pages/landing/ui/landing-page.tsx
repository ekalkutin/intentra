import { Menu, Pause, Play, Users, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { useHasSession } from '@/entities/session';
import { ROUTES } from '@/shared/config';
import { cn } from '@/shared/lib';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Brand,
  Button,
} from '@/shared/ui';

import { useSheetMotion } from '../lib/use-sheet-motion';

import { KnowledgeScene } from './knowledge-scene';
import { LandingAction } from './landing-action';
import { McpShowcase } from './mcp-showcase';
import { ProductDemo } from './product-demo';

const navigation = ['product', 'benefits', 'agents', 'faq'] as const;
const faqs = ['1', '2', '3', '4', '5', '6'] as const;
const agents = ['claude', 'codex', 'cursor'] as const;
const signatures = ['drafted', 'checked', 'approved'] as const;

function StartLink({ closing = false }: { readonly closing?: boolean }) {
  const { t } = useTranslation();
  const signedIn = useHasSession();
  return (
    <LandingAction to={signedIn ? ROUTES.home : ROUTES.signUp}>
      {t(
        signedIn
          ? 'landing.workspace'
          : closing
            ? 'landing.closing.action'
            : 'landing.start',
      )}
    </LandingAction>
  );
}

/** A section rule of the sheet, with registration crosses where it meets the frame. */
function SheetRule({ lead = false }: { readonly lead?: boolean }) {
  return (
    <div
      className={cn('landing-divider', lead && 'landing-divider-lead')}
      aria-hidden='true'
    >
      <span className='landing-rule' />
      <i className='landing-cross' />
      <i className='landing-cross' />
    </div>
  );
}

export function LandingPage() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useSheetMotion(root);
  useEffect(() => {
    const previous = document.title;
    document.title = t('landing.title');
    const description = document.createElement('meta');
    description.name = 'description';
    description.content = t('landing.description');
    document.head.append(description);
    return () => {
      document.title = previous;
      description.remove();
    };
  }, [t]);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        document.getElementById('landing-menu-toggle')?.focus();
      }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [menuOpen]);

  return (
    <div
      ref={root}
      className={cn('landing dark', paused && 'landing-paused')}
      id='top'
    >
      <a className='landing-skip' href='#main'>
        {t('landing.skip')}
      </a>
      <div className='landing-sheet'>
        <div className='landing-grid' aria-hidden='true'>
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <header className='landing-header'>
          <a href='#top' className='landing-logotype'>
            {t('brand')}
          </a>
          <nav
            className='landing-desktop-nav'
            aria-label={t('landing.nav.label')}
          >
            {navigation.map(item => (
              <a key={item} href={`#${item}`}>
                {t(`landing.nav.${item}`)}
              </a>
            ))}
          </nav>
          <div className='landing-header-actions'>
            <Button
              className='landing-motion-toggle'
              variant='ghost'
              size='icon'
              aria-label={t(
                paused ? 'landing.hero.play' : 'landing.hero.pause',
              )}
              aria-pressed={paused}
              onClick={() => setPaused(!paused)}
            >
              {paused ? <Play /> : <Pause />}
            </Button>
            <Link to={ROUTES.signIn} className='landing-login'>
              {t('landing.signIn')}
            </Link>
            <Button
              id='landing-menu-toggle'
              className='landing-menu-toggle'
              variant='ghost'
              size='icon'
              aria-label={t(
                menuOpen ? 'landing.nav.close' : 'landing.nav.open',
              )}
              aria-expanded={menuOpen}
              aria-controls='landing-mobile-menu'
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </header>
        {menuOpen && (
          <nav
            id='landing-mobile-menu'
            className='landing-mobile-nav'
            aria-label={t('landing.nav.label')}
          >
            {navigation.map(item => (
              <a
                key={item}
                href={`#${item}`}
                onClick={() => setMenuOpen(false)}
              >
                {t(`landing.nav.${item}`)}
              </a>
            ))}
          </nav>
        )}
        <main id='main'>
          <section className='landing-hero' aria-labelledby='hero-title'>
            <div className='landing-crosshair' aria-hidden='true'>
              <i />
              <i />
              <code />
            </div>
            <div className='landing-hero-copy'>
              <h1 id='hero-title'>
                <span className='landing-mask'>
                  <span>{t('landing.hero.line1')}</span>
                </span>
                <span className='landing-mask'>
                  <span className='landing-hero-accent'>
                    {t('landing.hero.line2')}
                  </span>
                </span>
              </h1>
              <p>{t('landing.hero.text')}</p>
              <div className='landing-hero-actions'>
                <StartLink />
                <a href='#agents' className='landing-demo-link'>
                  {t('landing.demo')}
                </a>
              </div>
            </div>
          </section>
          <SheetRule lead />
          <section
            id='product'
            className='landing-product'
            aria-labelledby='product-title'
          >
            <h2 id='product-title' className='sr-only'>
              {t('landing.demoSection.title')}
            </h2>
            <ProductDemo paused={paused} autoPlay />
          </section>
          <SheetRule />
          <div className='landing-partners'>
            <p>{t('landing.strip.text')}</p>
            <div>
              <strong>
                <Users size={18} aria-hidden='true' />
                {t('landing.strip.team')}
              </strong>
              <small>{t('landing.strip.web')}</small>
            </div>
            {agents.map(agent => (
              <div key={agent}>
                <strong>{t(`landing.strip.${agent}`)}</strong>
                <small>{t('landing.strip.protocol')}</small>
              </div>
            ))}
          </div>
          <SheetRule />
          <KnowledgeScene paused={paused} />
          <SheetRule />
          <section id='agents' className='landing-agents'>
            <McpShowcase paused={paused} />
          </section>
          <SheetRule />
          <section id='faq' className='landing-faq'>
            <div className='landing-faq-grid'>
              <h2>{t('landing.faq.title')}</h2>
              <Accordion>
                {faqs.map(n => (
                  <AccordionItem key={n} value={n}>
                    <AccordionTrigger>
                      {t(`landing.faq.q${n}`)}
                    </AccordionTrigger>
                    <AccordionContent>
                      {t(`landing.faq.a${n}`)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
          <SheetRule />
          <section className='landing-closing'>
            <h2>{t('landing.closing.title')}</h2>
            <p>{t('landing.closing.text')}</p>
            <StartLink closing />
          </section>
        </main>
        <footer className='landing-footer'>
          <SheetRule />
          <a
            href='#top'
            className='landing-footer-brand'
            aria-label={t('brand')}
          >
            <Brand className='landing-wordmark' />
          </a>
          <div className='landing-footer-row'>
            <div className='landing-footer-meta'>
              <p>{t('landing.footer.note')}</p>
              <p>{t('landing.demoSection.label')}</p>
              <p>
                <span>
                  {t('landing.footer.copyright', {
                    year: new Date().getFullYear(),
                  })}
                </span>
                <a href='#top'>{t('landing.footer.top')}</a>
              </p>
            </div>
            <div
              className='landing-title-block'
              role='group'
              aria-label={t('landing.footer.sheet.label')}
            >
              <div className='landing-title-roles'>
                {signatures.map(role => (
                  <div key={role}>
                    <span>{t(`landing.footer.sheet.${role}`)}</span>
                    <span>{t(`landing.footer.sheet.${role}By`)}</span>
                    <span>
                      {role === 'approved' && (
                        <svg
                          className='landing-sign'
                          viewBox='0 0 24 24'
                          aria-hidden='true'
                        >
                          <path d='M4 12.5 9.5 18 20 6.5' />
                        </svg>
                      )}
                    </span>
                  </div>
                ))}
              </div>
              <div className='landing-title-name'>
                <strong>{t('brand')}</strong>
                <span>{t('landing.footer.tagline')}</span>
              </div>
              <div className='landing-title-count'>
                {t('landing.footer.sheet.number')}
              </div>
              <div className='landing-title-count'>
                {t('landing.footer.sheet.total')}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
