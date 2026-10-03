import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { useHasSession } from '@/entities/session';
import { ROUTES } from '@/shared/config';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Brand,
  Button,
} from '@/shared/ui';

import { useSheetMotion } from '../lib/use-sheet-motion';
import { another, DEMO_CASES } from '../model/demo-interview';
import { DEVELOPER } from '../model/developer';

import { KnowledgeScene } from './knowledge-scene';
import { LandingAction } from './landing-action';
import { LandingLanguage } from './landing-language';
import { McpShowcase } from './mcp-showcase';
import { ProductDemo } from './product-demo';
import { SocialIcon } from './social-icon';

const navigation = ['product', 'benefits', 'agents', 'faq'] as const;
const faqs = ['1', '2', '3', '4', '5', '6'] as const;
const phrases = ['line2', 'line2b', 'line2c'] as const;

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
function SheetRule() {
  return (
    <div className='landing-divider' aria-hidden='true'>
      <span className='landing-rule' />
      <i className='landing-cross' />
      <i className='landing-cross' />
    </div>
  );
}

export function LandingPage() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  // One fictional product runs through the interview and the scene after it.
  const [topic, setTopic] = useState(() => another(DEMO_CASES, null));
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
    <div ref={root} className='landing dark' id='top'>
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
            <LandingLanguage />
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
            <div className='landing-hero-lines' aria-hidden='true' />
            <div className='landing-hero-copy'>
              <h1
                id='hero-title'
                aria-label={`${t('landing.hero.line1')} ${t('landing.hero.line2')}`}
              >
                <span className='landing-mask' aria-hidden='true'>
                  <span className='landing-hero-lead'>
                    {t('landing.hero.line1')}
                  </span>
                </span>
                <span className='landing-mask' aria-hidden='true'>
                  <span className='landing-hero-accent landing-rotator'>
                    {phrases.map(phrase => (
                      <span key={phrase}>{t(`landing.hero.${phrase}`)}</span>
                    ))}
                  </span>
                </span>
              </h1>
              <p>{t('landing.hero.text')}</p>
              <div className='landing-hero-actions'>
                <StartLink />
                <a href='#product' className='landing-demo-link'>
                  {t('landing.demo')}
                </a>
              </div>
            </div>
          </section>
          <SheetRule />
          <section id='product' className='landing-product'>
            <div className='landing-section-intro'>
              <h2>{t('landing.demoSection.title')}</h2>
              <p>{t('landing.demoSection.text')}</p>
            </div>
            <ProductDemo topic={topic} onTopicChange={setTopic} />
          </section>
          <SheetRule />
          <KnowledgeScene
            key={topic}
            topic={topic}
            onAnother={() => setTopic(another(DEMO_CASES, topic))}
          />
          <SheetRule />
          <section id='agents' className='landing-agents'>
            <McpShowcase paused={false} />
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
            <p>
              {t('landing.footer.copyright', {
                year: new Date().getFullYear(),
              })}
              <span>{t('landing.footer.note')}</span>
            </p>
            <address className='landing-developer'>
              <p className='landing-built'>
                <span>{t('landing.footer.developer')}</span>{' '}
                <a href={`mailto:${DEVELOPER.email}`}>{DEVELOPER.name}</a>
              </p>
              <ul>
                {DEVELOPER.links.map(link => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      target='_blank'
                      rel='noreferrer'
                      aria-label={link.label}
                      title={link.label}
                    >
                      <SocialIcon id={link.id} />
                    </a>
                  </li>
                ))}
              </ul>
            </address>
          </div>
        </footer>
      </div>
    </div>
  );
}
